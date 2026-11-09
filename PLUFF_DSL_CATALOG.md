# Pluff Tatemono DSL Catalog

This is an inventory of supported Tatemono DSL markers and their purpose. It is
for finding the right block, not a syntax or field reference. For block shapes,
fields, examples, validation rules, and known limitations, use
[PLUFF_GUIDELINES_v14.md](./PLUFF_GUIDELINES_v14.md) and the corresponding
generator.

## Shared app metadata and configuration

| DSL marker | Purpose |
|---|---|
| `@arkzen:meta` | Identifies the Tatemono and configures shared app settings such as its name and authentication. |
| `@arkzen:meta:web` | Web title, branding, SEO/social metadata, favicon, and PWA settings. |
| `@arkzen:meta:native` | Shared native app labels and supported Expo app metadata. |
| `@arkzen:web:config` | Web runtime configuration. |
| `@arkzen:native:config` | Native theme, fonts, and other native configuration. |
| `@arkzen:desktop:config` | Shared desktop window settings used by Electron and Tauri shells. |

## Data, APIs, and backend behavior

Backend-specific code variants use `php`, `ts`, `py`, `java`, `cs`, `go`, or
`rs` where that block supports the variant. A YAML-only declaration is shared
where supported; a code body belongs to its backend variant.

| DSL marker | Purpose |
|---|---|
| `@arkzen:database[:identifier]` | Declares one database table, its columns, relationships, indexes, and optional seed data. |
| `@arkzen:api[:identifier]` | Declares a model-backed API resource, CRUD/custom endpoints, validation, middleware, and response behavior. |
| `@arkzen:routes` | Declares custom routes that do not need a model-backed API resource. |
| `@arkzen:endpoint:<backend>:name` | Supplies custom code for a named API endpoint. |
| `@arkzen:handler:<backend>:name` | Supplies custom code for a named custom-route handler. |
| `@arkzen:policy:<backend>:method` | Implements a named authorization policy method. |
| `@arkzen:middleware:<backend>:name` | Defines reusable backend middleware. |
| `@arkzen:realtime:identifier` | Declares realtime channel configuration and, when needed, backend channel authorization code. |
| `@arkzen:events[:identifier]` | Declares events and their listeners. |
| `@arkzen:listener:<backend>:Name` | Implements a backend event listener. |
| `@arkzen:jobs[:backend]:identifier` | Configures a background job and optionally provides its backend job body. |
| `@arkzen:notifications[:backend]:identifier` | Configures a notification's channels/content and optionally custom backend delivery code. |
| `@arkzen:mail[:backend]:identifier` | Declares an email and optional HTML/template body for the supported backend. |
| `@arkzen:console[:backend]:identifier` | Declares a CLI command and optional implementation and schedule. |
| `@arkzen:module:rs` | Supplies a Rust module snippet for the Rust backend. |

## Web UI

| DSL marker | Purpose |
|---|---|
| `@arkzen:web:page:name` | Declares a web page and its route. |
| `@arkzen:web:page:layout:<declaration>` | Inline page setting for a built-in guard and/or named layout; it is not a standalone block. |
| `@arkzen:web:layout:name` | Defines a reusable web page wrapper; may declare a parent layout. |
| `@arkzen:web:components:name` | Defines reusable web components and shared hooks, stores, types, constants, and utilities. |
| `@arkzen:web:style` | Defines global web CSS. |
| `@arkzen:web:style:Name` | Defines component-scoped CSS Modules styles. |
| `@arkzen:web:animation` | Defines web animation setup and page animation variants. |
| `@arkzen:web:script` | Defines global web TypeScript helpers. |
| `@arkzen:web:script:name` | Defines a named web TypeScript helper module. |
| `@arkzen:web:error:404` / `@arkzen:web:error:500` | Defines web not-found and server-error UI. |

## Native UI: Expo and bare React Native

| DSL marker | Purpose |
|---|---|
| `@arkzen:import:expo` / `@arkzen:import:rn` | Selects code or imports for Expo versus bare React Native inside supported native blocks. |
| `@arkzen:native:page:name` | Declares an Expo/bare-RN screen and its route. |
| `@arkzen:native:page:layout:<declaration>` | Inline native page layout/guard setting; it is not a standalone block. |
| `@arkzen:native:layout:name` | Defines a reusable Expo/bare-RN screen wrapper; may declare a parent. |
| `@arkzen:native:components:name` | Defines reusable Expo/bare-RN components. |
| `@arkzen:native:style` | Defines global CSS-like native styles that the engine converts. |
| `@arkzen:native:style:name` | Defines a named React Native StyleSheet. |
| `@arkzen:native:error:404` / `@arkzen:native:error:500` | Defines native not-found and error screens, with target-specific code as needed. |
| `@arkzen:native:animation:expo` / `@arkzen:native:animation:rn` | Defines Expo or bare-RN animation hooks/helpers. |
| `@arkzen:native:script:expo` / `@arkzen:native:script:rn` | Defines global or named Expo/bare-RN TypeScript helpers. |

## Native UI: Lynx

Lynx is a separate renderer, not a React Native target. Its UI blocks use
Lynx-specific markers and do not use Expo/RN import pairs.

| DSL marker | Purpose |
|---|---|
| `@arkzen:native:page:lynx:name` | Declares a Lynx page and its route. |
| `@arkzen:native:page:lynx:layout:<declaration>` | Inline Lynx page layout/guard setting; it is not a standalone block. |
| `@arkzen:native:layout:lynx:name` | Defines a reusable Lynx page wrapper. |
| `@arkzen:native:components:lynx:name` | Defines reusable Lynx components. |
| `@arkzen:native:style:lynx` | Defines global Lynx styles. |
| `@arkzen:native:style:lynx:name` | Defines named Lynx styles. |
| `@arkzen:native:error:404:lynx` / `@arkzen:native:error:500:lynx` | Defines Lynx not-found and error UI. |
| `@arkzen:native:animation:lynx` | Defines Lynx animation helpers. |
| `@arkzen:native:script:lynx` / `@arkzen:native:script:lynx:name` | Defines global or named Lynx helpers. |

## Games

Game blocks are separate export targets; they are not web or native UI blocks.

| DSL marker | Purpose |
|---|---|
| `@arkzen:godot:project` | Sets Godot project identity, version, renderer, main scene, and display settings. |
| `@arkzen:godot:world` | Configures the generated Godot world, including visuals, props, and NPCs. |
| `@arkzen:godot:input` | Declares Godot input actions and key bindings. |
| `@arkzen:godot:assets` | Declares assets for use by Godot scenes and world settings. |
| `@arkzen:godot:scene:name` | Declares a Godot scene, root node, and scene nodes/components. |
| `@arkzen:godot:behavior:player` | Configures the generated Godot player controller. |
| `@arkzen:godot:behavior:camera` | Configures the generated Godot follow camera. |
| `@arkzen:godot:multiplayer` | Enables and configures the generated Godot ENet multiplayer support. |
| `@arkzen:godot:export` | Declares Godot export presets and runnable settings. |
| `@arkzen:unity:project` | Configures a Unity runner project or general Unity scene-mode project. |
| `@arkzen:unity:game` | Configures the Unity dinosaur runner template. |
| `@arkzen:unity:visuals` | Configures optional dinosaur-runner visual settings. |
| `@arkzen:unity:controls` | Configures optional dinosaur-runner restart and pointer controls. |
| `@arkzen:unity:scene:name` | Declares a Unity scene and its object/component hierarchy in scene mode. |
| `@arkzen:unity:environment` | Configures optional Unity scene lighting and fog. |
| `@arkzen:unity:assets` | Declares source assets used by Unity runner or scene mode. |
| `@arkzen:unity:export` | Declares supported Unity scene-mode build targets. |

## Free files (any stack, or none)

| DSL marker | Purpose |
|---|---|
| `@arkzen:file:id` | Writes any text file to a `path:` you choose. Default location is `custom/<tatemono-name>/`; `{frontend}`, `{app}`, `{desktop}`, `{backend}` start the path inside the active stack; a leading `/` means the project root. Always overwrites. Valid in a tatemono that has only `@arkzen:meta` and file blocks. Also works in Godot and Unity tatemonos, where `path:` is relative to the generated game project. |

## Related conventions (not block markers)

- Tatemono files reference files under `tatemonos/<name>/assets/`; the `assets/`
  folder itself is not a DSL block.
- `@arkzen:store:<name>` may be detected by legacy parser helpers, but it is not
  a supported store declaration. Put web stores in `@arkzen:web:components`;
  native state belongs in native component code.
