using System.Threading.Channels;

namespace Pluff.AspNet.Runtime;

public sealed class BackgroundTaskQueue : BackgroundService
{
    private readonly Channel<WorkItem> _queue = Channel.CreateUnbounded<WorkItem>(
        new UnboundedChannelOptions { SingleReader = true, SingleWriter = false });

    public bool Enqueue(
        Func<CancellationToken, Task> work,
        int tries = 1,
        TimeSpan? timeout = null,
        Func<CancellationToken, Task>? onFailure = null) =>
        _queue.Writer.TryWrite(new WorkItem(work, Math.Max(1, tries), timeout, onFailure));

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var item in _queue.Reader.ReadAllAsync(stoppingToken))
        {
            for (var attempt = 1; attempt <= item.Tries; attempt++)
            {
                using var attemptToken = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);
                if (item.Timeout is { } timeout) attemptToken.CancelAfter(timeout);
                try
                {
                    await item.Work(attemptToken.Token);
                    break;
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    return;
                }
                catch (Exception exception)
                {
                    if (attempt < item.Tries)
                    {
                        Console.Error.WriteLine($"[ASP.NET queue] Attempt {attempt}/{item.Tries} failed; retrying: {exception}");
                        try
                        {
                            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
                        }
                        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                        {
                            return;
                        }
                        continue;
                    }

                    Console.Error.WriteLine($"[ASP.NET queue] Work failed after {attempt} attempt(s): {exception}");
                    if (item.OnFailure is not null)
                    {
                        try
                        {
                            await item.OnFailure(stoppingToken);
                        }
                        catch (Exception failureException)
                        {
                            Console.Error.WriteLine($"[ASP.NET queue] Failure handler failed: {failureException}");
                        }
                    }
                }
            }
        }
    }

    private sealed record WorkItem(
        Func<CancellationToken, Task> Work,
        int Tries,
        TimeSpan? Timeout,
        Func<CancellationToken, Task>? OnFailure);
}
