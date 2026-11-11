const vscode = require('vscode')

const backendVariants = [
  { token: 'php', language: 'PHP' },
  { token: 'ts', language: 'TypeScript / Express' },
  { token: 'py', language: 'Python / FastAPI' },
  { token: 'java', language: 'Java / Spring Boot' },
  { token: 'cs', language: 'C# / ASP.NET Core' },
  { token: 'go', language: 'Go' },
  { token: 'rs', language: 'Rust' },
]

const shapeDBlocks = ['endpoint', 'handler', 'middleware', 'policy', 'listener']
const shapeBBlocks = ['jobs', 'console', 'notifications']

function yamlSnippet(label, tag, body) {
  return {
    label,
    detail: 'Tatemono YAML block',
    insertText: new vscode.SnippetString(`/* @arkzen:${tag}\n${body}\n*/`),
  }
}

function gameYamlSnippet(engine, label, tag, body) {
  return {
    label,
    detail: `${engine} game DSL YAML block with matching closing marker`,
    insertText: new vscode.SnippetString(
      `/* @arkzen:${tag}\n${body}\n*/\n/* @arkzen:${tag}:end */`
    ),
  }
}

function codeSnippet(label, tag, body = '${1:}') {
  return {
    label,
    detail: 'Tatemono code block (opening and closing tags included)',
    insertText: new vscode.SnippetString(
      `/* @arkzen:${tag} */\n${body}\n/* @arkzen:${tag}:end */`
    ),
  }
}

function parentLayoutSnippet(label, tag, parent, body) {
  return {
    label,
    detail: 'Tatemono layout with a parent layout',
    insertText: new vscode.SnippetString(
      `/* @arkzen:${tag}\nparent: \${1:${parent}}\n*/\n${body}\n/* @arkzen:${tag}:end */`
    ),
  }
}

function backendSnippetItems(marker, shape) {
  return backendVariants.map(({ token, language }) => {
    const tag = `${marker}:${token}:$1`
    const closeTag = `${marker}:${token}:$1:end`
    const isMail = marker === 'mail'
    const isShapeB = shape === 'B'
    const yaml = isMail
      ? 'subject: "${2:Welcome}"\ndata:\n  name: ${3:string}\n  app_name: ${4:string}'
      : marker === 'jobs'
        ? 'queue: ${2:default}\ntries: ${3:3}\ntimeout: ${4:60}'
        : marker === 'console'
          ? 'signature: ${2:tatemono:command}\ndescription: ${3:Describe this command}'
          : 'channels: [database]\nmessage: ${2:Notification message}'
    const open = isShapeB
      ? `/* @arkzen:${tag}\n${yaml}\n*/`
      : `/* @arkzen:${tag}\n*/`
    const body = isMail ? '${5:<h1>Mail content</h1>}' : isShapeB ? '${5:}' : '${4:}'
    return {
      label: `${marker}:${token}:…`,
      detail: `${language} body with matching opening and closing tags`,
      insertText: new vscode.SnippetString(`${open}\n${body}\n/* @arkzen:${closeTag} */`),
    }
  })
}

function frontendItems() {
  const items = [
    yamlSnippet('meta', 'meta', 'name: ${1:my-tatemono}\nversion: 1.0.0\ndescription: ${2:Description}\nauth: false'),
    yamlSnippet('meta:web', 'meta:web', 'title: ${1:App title}\ndescription: ${2:Description}'),
    yamlSnippet('meta:native', 'meta:native', 'label: ${1:App title}\nexpo:\n  bundle_id: ${2:com.example.app}\n  scheme: ${3:myapp}'),
    yamlSnippet('web:config', 'web:config', 'toast:\n  position: top-right\n  duration: 3000'),
    yamlSnippet('native:config', 'native:config', 'theme:\n  primary: "${1:#6366f1}"\n  background: "${2:#ffffff}"'),
    yamlSnippet('desktop:config', 'desktop:config', 'window:\n  title: "${1:My app}"\n  width: ${2:1200}\n  height: ${3:800}'),
    yamlSnippet('database:<table>', 'database:${1:items}', 'table: ${1:items}\ntimestamps: true\ncolumns:\n  name:\n    type: string\n    length: 255\n    nullable: false'),
    yamlSnippet('api:<name>', 'api:${1:items}', 'model: ${2:Item}\ncontroller: ${3:ItemController}\nprefix: /api/${4:tatemono}\nmiddleware: []\nresource: true\nendpoints:\n  index:\n    method: GET\n    route: /\n    description: ${5:List items}\n    response:\n      type: collection'),
    yamlSnippet('routes', 'routes', 'controller: ${1:CustomController}\nmiddleware: []\nroutes:\n  - method: GET\n    route: /${2:health}\n    handler: ${3:health}'),
    {
      label: 'realtime:<channel>',
      detail: 'Realtime channel configuration',
      insertText: new vscode.SnippetString('/* @arkzen:realtime:${1:channel}\nauth: ${2:authenticated}\n*/\n/* @arkzen:realtime:${1:channel}:end */'),
    },
    {
      label: 'events:<name>',
      detail: 'Events and listeners configuration',
      insertText: new vscode.SnippetString('/* @arkzen:events:${1:events}\nlisteners: [${2:LogEvent}]\n*/\n/* @arkzen:events:${1:events}:end */'),
    },
    codeSnippet('web:components:<name>', 'web:components:${1:shared}', "'use client'\n\nimport React from 'react'\n\nexport const ${2:MyComponent} = () => <div>${3:Content}</div>"),
    codeSnippet('web:layout:<name>', 'web:layout:${1:app}', "'use client'\n\nimport React from 'react'\n\nexport const ${2:AppLayout} = ({ children }: { children: React.ReactNode }) => <>{children}</>"),
    parentLayoutSnippet('web:layout:<name> (parent)', 'web:layout:${2:panel}', 'shell', 'import React from \'react\'\n\nexport const ${3:PanelLayout} = ({ children }: { children: React.ReactNode }) => <>{children}</>'),
    codeSnippet('web:page:<name>', 'web:page:${1:index}', '/* @arkzen:web:page:layout:guest */\n\nconst ${2:IndexPage} = () => <main>${3:Content}</main>'),
    codeSnippet('web:error:404', 'web:error:404', 'export default function NotFoundPage() { return <main>Not found</main> }'),
    codeSnippet('web:error:500', 'web:error:500', 'export default function ServerErrorPage({ reset }: { reset: () => void }) { return <button onClick={reset}>Try again</button> }'),
    codeSnippet('web:animation', 'web:animation', 'export const pageVariants = { initial: { opacity: 0 }, animate: { opacity: 1 } }'),
    codeSnippet('web:script', 'web:script', 'export const ${1:helper} = () => ${2:null}'),
    codeSnippet('web:script:<name>', 'web:script:${1:helpers}', 'export const ${2:helper} = () => ${3:null}'),
    codeSnippet('web:style', 'web:style', ':root {\n  --color-primary: ${1:#6366f1};\n}'),
    codeSnippet('web:style:<Component>', 'web:style:${1:Component}', '.${2:component} {\n  color: ${3:#111827};\n}'),
    codeSnippet('native:components:<name>', 'native:components:${1:shared}', "import React from 'react'\nimport { View, Text } from 'react-native'\n\nexport const ${2:Card} = () => <View><Text>${3:Content}</Text></View>"),
    codeSnippet('native:layout:<name>', 'native:layout:${1:app}', "import React from 'react'\nimport { View } from 'react-native'\n\nexport const ${2:AppLayout} = ({ children }: { children: React.ReactNode }) => <View style={{ flex: 1 }}>{children}</View>"),
    parentLayoutSnippet('native:layout:<name> (parent)', 'native:layout:${2:panel}', 'app', 'import React from \'react\'\nimport { View } from \'react-native\'\n\nexport const ${3:PanelLayout} = ({ children }: { children: React.ReactNode }) => <View style={{ flex: 1 }}>{children}</View>'),
    codeSnippet('native:page:<name>', 'native:page:${1:index}', "import React from 'react'\nimport { View, Text } from 'react-native'\n\nconst ${2:IndexScreen} = () => <View><Text>${3:Content}</Text></View>"),
    codeSnippet('native:error:404', 'native:error:404', "import React from 'react'\nimport { View, Text } from 'react-native'\n\nconst NotFoundScreen = () => <View><Text>Not found</Text></View>"),
    codeSnippet('native:error:500', 'native:error:500', "import React from 'react'\nimport { View, Text } from 'react-native'\n\nconst ErrorScreen = () => <View><Text>Something went wrong</Text></View>"),
    codeSnippet('native:animation:expo', 'native:animation:expo', "import { useSharedValue, withTiming } from 'react-native-reanimated'\n\nexport function useFadeIn() {\n  const opacity = useSharedValue(0)\n  return { opacity, start: () => { opacity.value = withTiming(1) } }\n}"),
    codeSnippet('native:animation:rn', 'native:animation:rn', "import { useSharedValue, withTiming } from 'react-native-reanimated'\n\nexport function useFadeIn() {\n  const opacity = useSharedValue(0)\n  return { opacity, start: () => { opacity.value = withTiming(1) } }\n}"),
    codeSnippet('native:animation:lynx', 'native:animation:lynx', "import { useState, useEffect } from '@lynx-js/react'\n\nexport const ${1:useFadeSlideIn} = (delay = 0) => {\n  const [visible, setVisible] = useState(false)\n  useEffect(() => {\n    const timeout = setTimeout(() => setVisible(true), delay)\n    return () => clearTimeout(timeout)\n  }, [])\n  return {\n    style: {\n      opacity: visible ? 1 : 0,\n      transform: [{ translateY: visible ? 0 : 16 }],\n      transition: 'opacity 350ms ease-out, transform 350ms ease-out',\n    },\n  }\n}"),
    codeSnippet('native:script:expo', 'native:script:expo', 'export const ${1:API_TIMEOUT} = ${2:8000}'),
    codeSnippet('native:script:rn', 'native:script:rn', 'export const ${1:API_TIMEOUT} = ${2:8000}'),
    codeSnippet('native:script:lynx', 'native:script:lynx', 'export const ${1:API_TIMEOUT} = ${2:8000}'),
    codeSnippet('native:script:expo:<name>', 'native:script:expo:${1:helpers}', 'export const ${2:helper} = () => ${3:null}'),
    codeSnippet('native:script:rn:<name>', 'native:script:rn:${1:helpers}', 'export const ${2:helper} = () => ${3:null}'),
    codeSnippet('native:script:lynx:<name>', 'native:script:lynx:${1:helpers}', 'export const ${2:helper} = () => ${3:null}'),
    codeSnippet('native:style', 'native:style', '.card {\n  background-color: ${1:#ffffff};\n}'),
    codeSnippet('native:style:<name>', 'native:style:${1:shared}', '.card {\n  background-color: ${2:#ffffff};\n}'),
    codeSnippet('native:components:lynx:<name>', 'native:components:lynx:${1:shared}', "import { type ReactNode } from '@lynx-js/react'\n\nexport const ${2:Card} = ({ children }: { children: ReactNode }) => <view>{children}</view>"),
    codeSnippet('native:layout:lynx:<name>', 'native:layout:lynx:${1:app}', "import { type ReactNode } from '@lynx-js/react'\n\nexport const ${2:AppLayout} = ({ children }: { children: ReactNode }) => <view>{children}</view>"),
    parentLayoutSnippet('native:layout:lynx:<name> (parent)', 'native:layout:lynx:${2:panel}', 'app', "import { type ReactNode } from '@lynx-js/react'\n\nexport const ${3:PanelLayout} = ({ children }: { children: ReactNode }) => <view>{children}</view>"),
    codeSnippet('native:page:lynx:<name>', 'native:page:lynx:${1:index}', "import { useState } from '@lynx-js/react'\n\nconst ${2:IndexLynxPage} = () => <view><text>${3:Content}</text></view>"),
    codeSnippet('native:error:404:lynx', 'native:error:404:lynx', 'const NotFoundLynx = () => <view><text>Not found</text></view>'),
    codeSnippet('native:error:500:lynx', 'native:error:500:lynx', 'const ErrorLynx = () => <view><text>Something went wrong</text></view>'),
    codeSnippet('native:style:lynx', 'native:style:lynx', '.card {\n  background-color: ${1:#ffffff};\n}'),
    codeSnippet('native:style:lynx:<name>', 'native:style:lynx:${1:shared}', '.card {\n  background-color: ${2:#ffffff};\n}'),

    codeSnippet('native:frame:expo', 'native:frame:expo', "import React from 'react'\nimport { Tabs } from 'expo-router'\nimport { StatusBar } from 'expo-status-bar'\n\nexport default function ${1:MyLayout}() {\n  return (\n    <>\n      <StatusBar style=\"light\" />\n      <Tabs screenOptions={{ headerShown: true }}>\n        <Tabs.Screen name=\"index\" options={{ title: '${2:Home}' }} />\n      </Tabs>\n    </>\n  )\n}"),
    codeSnippet('native:frame:rn', 'native:frame:rn', "import React from 'react'\nimport { View, StatusBar } from 'react-native'\n\nexport const screenOptions = { headerShown: true }\n\nexport const Frame = ({ children }: { children: React.ReactNode }) => (\n  <View style={{ flex: 1 }}>\n    <StatusBar barStyle=\"light-content\" />\n    {children}\n  </View>\n)"),
    codeSnippet('native:frame:lynx', 'native:frame:lynx', "import { type ReactNode } from '@lynx-js/react'\n\nexport const Frame = ({ children }: { module: string; page: string; children: ReactNode }) => (\n  <view style={{ flex: 1 }}>{children}</view>\n)"),
    codeSnippet('desktop:frame:electron', 'desktop:frame:electron', "export const windowOptions = { width: ${1:1200}, height: ${2:800} }\n\nexport function setup(ctx) {\n  ${3:// menus, tray, shortcuts, ctx.onEvent(channel, handler)}\n}"),
    codeSnippet('desktop:frame:tauri', 'desktop:frame:tauri', "pub fn frame(app: &mut tauri::App) -> Result<(), Box<dyn Error>> {\n    ${1:// menus, tray, events}\n    Ok(())\n}"),
    {
      label: 'file:<id>',
      detail: 'Free file block: writes any text file to a path you choose',
      insertText: new vscode.SnippetString('/* @arkzen:file:${1:landing}\npath: ${2:index.html}\n*/\n${3:}\n/* @arkzen:file:${1:landing}:end */'),
    },
  ]

  items.push(
    {
      label: 'import:expo / import:rn pair',
      detail: 'Paired import blocks for Expo and bare React Native',
      insertText: new vscode.SnippetString(
        `/* @arkzen:import:expo */\nimport { \${1:View, Text} } from 'react-native'\n/* @arkzen:import:expo:end */\n\n/* @arkzen:import:rn */\nimport { \${2:View, Text} } from 'react-native'\n/* @arkzen:import:rn:end */`
      ),
    },
    {
      label: 'module:rs',
      detail: 'Rust module body with matching opening and closing tags',
      insertText: new vscode.SnippetString(
        '/* @arkzen:module:rs\n*/\npub fn ${1:helper}() -> ${2:bool} { ${3:true} }\n/* @arkzen:module:rs:end */'
      ),
    }
  )
  return items
}

function backendItems() {
  const items = []
  for (const marker of shapeDBlocks) items.push(...backendSnippetItems(marker, 'D'))
  for (const marker of shapeBBlocks) items.push(...backendSnippetItems(marker, 'B'))
  items.push(...backendSnippetItems('mail', 'B'))
  return items
}

function gameItems() {
  return [
    gameYamlSnippet('Godot', 'godot:project', 'godot:project', 'godot_version: "4.x"\nname: \${1:My Godot Game}\nmain_scene: res://scenes/main.tscn\nrenderer: forward_plus'),
    gameYamlSnippet('Godot', 'godot:world', 'godot:world', 'tile_size: 1\ngrid_width: 40\ngrid_depth: 40\nblock_height: 0.6\nworld_margin: 2\nseed: 42\nprops: {}\nnpcs: {}'),
    gameYamlSnippet('Godot', 'godot:input', 'godot:input', 'actions:\n  move_left:\n    deadzone: 0.2\n    keys: [A, LEFT]'),
    gameYamlSnippet('Godot', 'godot:assets', 'godot:assets', 'textures:\n  player:\n    source: assets/player.png\n    filter: nearest'),
    gameYamlSnippet('Godot', 'godot:scene:<name>', 'godot:scene:\${1:main}', 'path: res://scenes/main.tscn\nroot:\n  name: Main\n  type: Node3D\nnodes: []'),
    gameYamlSnippet('Godot', 'godot:behavior:player', 'godot:behavior:player', 'script: res://scripts/player.gd\nscene: res://scenes/player.tscn\nlanguage: gdscript\nextends: CharacterBody3D\nmovement:\n  input: [move_left, move_right, move_up, move_down]\n  speed: 4.0'),
    gameYamlSnippet('Godot', 'godot:behavior:camera', 'godot:behavior:camera', 'script: res://scripts/camera_follow.gd\nnode: Camera3D\ntarget: Player\nprojection: perspective\nfollow:\n  offset: [0, 4, -7]\n  smoothing: 8'),
    gameYamlSnippet('Godot', 'godot:multiplayer', 'godot:multiplayer', 'enabled: true\nport: 24567\nmax_clients: 8\nsync_rate: 20\ndefault_address: 127.0.0.1'),
    gameYamlSnippet('Godot', 'godot:export', 'godot:export', 'presets:\n  windows:\n    runnable: true'),
    gameYamlSnippet('Unity', 'unity:project (scene mode)', 'unity:project', 'mode: scene\nunity_version: 6000.0.38f1\nname: \${1:My Unity Game}\nmain_scene: Assets/Scenes/Main.unity\nwidth: 1280\nheight: 720'),
    gameYamlSnippet('Unity', 'unity:project (dino runner)', 'unity:project', 'unity_version: 6000.0.38f1\nname: \${1:My Dino Runner}\nwidth: 1280\nheight: 720\npixels_per_unit: 100'),
    gameYamlSnippet('Unity', 'unity:game', 'unity:game', 'type: dino_runner\ndinosaur: dino\nobstacle: cactus\njump_key: Space\ngravity: -30\njump_velocity: 12.5\nground_y: -2\nscroll_speed: 7.5\nspawn_interval_min: 1.1\nspawn_interval_max: 2'),
    gameYamlSnippet('Unity', 'unity:visuals', 'unity:visuals', 'background_color: "#b3e0f5"\nground_color: "#338a4f"\ncamera_size: 5\nground_width: 24'),
    gameYamlSnippet('Unity', 'unity:controls', 'unity:controls', 'restart_key: R\npointer_enabled: true'),
    gameYamlSnippet('Unity', 'unity:scene:<name>', 'unity:scene:\${1:main}', 'path: Assets/Scenes/Main.unity\nnodes:\n  - name: MainCamera\n    type: camera\n    main: true\n    position: [0, 0, -10]'),
    gameYamlSnippet('Unity', 'unity:environment', 'unity:environment', 'ambient_color: "#a9c7d7"\nambient_intensity: 0.8\nfog_enabled: true\nfog_color: "#c5e0dc"\nfog_density: 0.008'),
    gameYamlSnippet('Unity', 'unity:assets', 'unity:assets', 'dino:\n  source: assets/dino.svg\ncactus:\n  source: assets/cactus.svg'),
    gameYamlSnippet('Unity', 'unity:export', 'unity:export', 'targets: [windows, linux, webgl]'),
  ]
}

function completionProvider() {
  const items = [...frontendItems(), ...backendItems(), ...gameItems()]
  return {
    provideCompletionItems(document, position) {
      const line = document.lineAt(position.line).text
      const before = line.slice(0, position.character)
      const openTag = before.match(/\/\*\s*@arkzen:([A-Za-z0-9:_{}.+-]+)(\s*\*\/)?$/)

      if (openTag && isClosableTag(openTag[1])) {
        const close = new vscode.CompletionItem(
          `Close @arkzen:${openTag[1]}`,
          vscode.CompletionItemKind.Snippet
        )
        close.detail = 'Insert matching Tatemono closing marker'
        close.insertText = new vscode.SnippetString(closingSuffix(openTag[1], Boolean(openTag[2])))
        close.range = new vscode.Range(position.line, position.character, position.line, position.character)
        return [close]
      }

      function closingSuffix(tag, hasInlineClose) {
        const marker = tag.split(':')[0]
        if (marker === 'godot' || marker === 'unity') {
          return `\n\${1:}\n*/\n/* @arkzen:${tag}:end */`
        }

        if (['jobs', 'console', 'notifications', 'mail'].includes(marker)) {
          const yaml = marker === 'jobs'
            ? 'queue: ${1:default}\ntries: ${2:3}\ntimeout: ${3:60}'
            : marker === 'console'
              ? 'signature: ${1:tatemono:command}\ndescription: ${2:Describe this command}'
              : marker === 'mail'
                ? 'subject: "${1:Welcome}"\ndata:\n  name: ${2:string}\n  app_name: ${3:string}'
                : 'channels: [database]\nmessage: ${1:Notification message}'
          const body = marker === 'mail' ? '${4:<h1>Mail content</h1>}' : '${4:}'
          return `\n${yaml}\n*/\n${body}\n/* @arkzen:${tag}:end */`
        }

        if (marker === 'file') {
          return `\npath: \${1:index.html}\n*/\n\${2:}\n/* @arkzen:${tag}:end */`
        }

        if (/^(?:web|native):layout:/.test(tag) && !hasInlineClose) {
          return `\nparent: \${1:parent-layout}\n*/\n\${2:}\n/* @arkzen:${tag}:end */`
        }

        const separator = ['endpoint', 'handler', 'middleware', 'policy', 'listener', 'module'].includes(marker)
          ? '\n*/'
          : ''
        return `${separator}\n\${1:}\n/* @arkzen:${tag}:end */`
      }

      function isClosableTag(tag) {
        return /^(?:(?:endpoint|handler|middleware|policy|listener|jobs|console|notifications|mail):(?:(?:php|ts|py|java|cs|go|rs):)?[A-Za-z0-9_-]+|module:rs|(?:web:(?:components|layout|page):[A-Za-z0-9_-]+|web:error:(?:404|500)|web:(?:animation|script|style)(?::[A-Za-z0-9_-]+)?)|(?:native:(?:components|layout|page):(?:(?:expo|rn|lynx):)?[A-Za-z0-9_-]+|native:error:(?:404|500)(?::(?:expo|rn|lynx))?|native:(?:animation|script):(?:expo|rn|lynx)(?::[A-Za-z0-9_-]+)?|native:style(?::(?:lynx:)?[A-Za-z0-9_-]+)?)|(?:godot:(?:project|world|input|assets|scene:[A-Za-z0-9_-]+|behavior:(?:player|camera)|multiplayer|export)|unity:(?:project|game|visuals|controls|scene:[A-Za-z0-9_-]+|environment|assets|export))|import:(?:expo|rn)|native:frame:(?:expo|rn|lynx)|desktop:frame:(?:electron|tauri)|file:[A-Za-z0-9_-]+)$/.test(tag)
      }

      const markerStart = before.lastIndexOf('/* @arkzen:')
      if (markerStart < 0) return undefined

      const range = new vscode.Range(position.line, markerStart, position.line, position.character)
      return items.map(({ label, detail, insertText }) => {
        const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Snippet)
        item.detail = detail
        item.insertText = insertText
        item.range = range
        return item
      })
    },
  }
}

function activate(context) {
  const provider = vscode.languages.registerCompletionItemProvider(
    { language: 'tatemono' },
    completionProvider(),
    '@',
    ':'
  )
  context.subscriptions.push(provider)
}

function deactivate() {}

module.exports = { activate, deactivate }
