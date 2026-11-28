#!/usr/bin/env python3
"""Runs a program inside a pseudo-terminal and plays a script of expected output and keystrokes.

Usage: pty_driver.py '<json spec>'    (the spec is described in pty.js)
Prints one JSON object: { exitCode, signal, output, matched, timedOut, error }.
Standard library only. Linux and macOS. Not supported on Windows.
"""
import os, sys, json, pty, re, select, time, fcntl, termios, struct, signal

ANSI = re.compile(r'\x1b\[[0-9;?]*[ -/]*[@-~]|\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)|\x1b[()][A-Za-z0-9]|\x1b[=>]')

def strip(text):
    return ANSI.sub('', text).replace('\r\n', '\n').replace('\r', '\n')

def main():
    spec = json.loads(sys.argv[1])
    cols, rows = spec.get('cols', 80), spec.get('rows', 24)
    overall = time.time() + spec.get('timeout', 30)
    env = dict(os.environ)
    env.update(spec.get('env') or {})
    env.setdefault('TERM', 'xterm-256color')
    env['COLUMNS'], env['LINES'] = str(cols), str(rows)
    result = {'exitCode': None, 'signal': None, 'output': '', 'matched': [], 'timedOut': False, 'error': None}

    master, slave = pty.openpty()
    fcntl.ioctl(slave, termios.TIOCSWINSZ, struct.pack('HHHH', rows, cols, 0, 0))
    pid = os.fork()
    if pid == 0:
        try:
            os.setsid()
            fcntl.ioctl(slave, termios.TIOCSCTTY, 0)
            for fd in (0, 1, 2):
                os.dup2(slave, fd)
            os.close(master)
            os.close(slave)
            if spec.get('cwd'):
                os.chdir(spec['cwd'])
            os.execvpe(spec['cmd'], [spec['cmd']] + spec.get('args', []), env)
        except Exception as e:  # noqa
            os.write(2, ('exec failed: %s\n' % e).encode())
            os._exit(127)
    os.close(slave)

    raw = b''
    cursor = 0           # position in the stripped text after the last matched step
    steps = list(spec.get('steps') or [])
    step_deadline = time.time() + steps[0].get('timeout', 10) if steps else None
    exited = None

    def pump(wait):
        nonlocal raw
        r, _, _ = select.select([master], [], [], wait)
        if r:
            try:
                data = os.read(master, 65536)
            except OSError:
                return False
            if not data:
                return False
            raw += data
        return True

    def reap(block):
        nonlocal exited
        if exited is not None:
            return True
        try:
            done, status = os.waitpid(pid, 0 if block else os.WNOHANG)
        except ChildProcessError:
            exited = (0, None)
            return True
        if done:
            if os.WIFEXITED(status):
                exited = (os.WEXITSTATUS(status), None)
            elif os.WIFSIGNALED(status):
                exited = (None, os.WTERMSIG(status))
            return True
        return False

    alive = True
    while time.time() < overall:
        alive = pump(0.05) and alive
        text = strip(raw.decode('utf-8', 'replace'))
        if steps:
            step = steps[0]
            m = re.compile(step['expect']).search(text, cursor) if step.get('expect') else True
            if m:
                result['matched'].append(step.get('expect') or '')
                if m is not True:
                    cursor = m.end()
                if step.get('delay'):
                    time.sleep(step['delay'])
                if step.get('send') is not None:
                    try:
                        os.write(master, step['send'].encode('utf-8'))
                    except OSError:
                        pass
                steps.pop(0)
                step_deadline = time.time() + steps[0].get('timeout', 10) if steps else None
            elif time.time() > step_deadline:
                result['error'] = 'timed out waiting for: %s' % step['expect']
                break
        if reap(False):
            # drain what is left
            for _ in range(20):
                if not pump(0.02):
                    break
            if steps:
                result['error'] = 'program exited while waiting for: %s' % steps[0]['expect']
            break
    else:
        result['timedOut'] = True
        result['error'] = result['error'] or 'overall timeout'

    if exited is None:
        try:
            os.killpg(pid, signal.SIGKILL)
        except Exception:
            try: os.kill(pid, signal.SIGKILL)
            except Exception: pass
        reap(True)
    for _ in range(10):
        if not pump(0.02):
            break
    result['exitCode'], result['signal'] = exited if exited else (None, None)
    result['output'] = raw.decode('utf-8', 'replace')
    result['text'] = strip(result['output'])
    try: os.close(master)
    except OSError: pass
    print(json.dumps(result))

main()
