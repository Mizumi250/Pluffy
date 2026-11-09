import fs from 'node:fs'
import path from 'node:path'
import { validateGameFreeFiles, writeGameFreeFiles } from '../free-files.js'
import { parseUnitySceneTatemono, writeUnitySceneProject } from './scene-generator.js'

const VECTOR_GRAPHICS_VERSION = '2.0.0-preview.25'

function assert(condition, message) {
  if (!condition) throw new Error(`[Unity generator] ${message}`)
}

function readBlock(source, marker, required = true) {
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const matches = [...source.matchAll(new RegExp(`^\\s*\\/\\* @arkzen:${escaped}\\r?\\n([\\s\\S]*?)^\\s*\\*\\/\\s*$`, 'gm'))]
  assert(matches.length <= 1, `Duplicate @arkzen:${marker} block`)
  if (required) assert(matches.length === 1, `A @arkzen:${marker} block is required`)
  return matches[0]?.[1] ?? null
}

function parseScalar(value, key) {
  const clean = value.trim()
  assert(clean.length > 0, `Unity ${key} cannot be empty`)
  if (clean === 'true') return true
  if (clean === 'false') return false
  if (/^-?(?:\d+\.?\d*|\.\d+)$/.test(clean)) return Number(clean)
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) return clean.slice(1, -1)
  return clean
}

function parseSimpleYaml(body, allowedKeys, label) {
  const result = {}
  for (const [index, rawLine] of body.split(/\r?\n/).entries()) {
    if (!rawLine.trim() || rawLine.trimStart().startsWith('#')) continue
    const match = rawLine.match(/^([a-z][a-z0-9_]*):\s*(.*?)\s*$/)
    assert(match, `${label} line ${index + 1} must be a key: value pair`)
    const [, key, value] = match
    assert(allowedKeys.includes(key), `${label} has unsupported key "${key}"`)
    assert(!Object.hasOwn(result, key), `${label} has duplicate key "${key}"`)
    result[key] = parseScalar(value, key)
  }
  return result
}

function parseUnityTatemono(source, tatemonoPath) {
  const meta = readBlock(source, 'meta')
  const metaValues = parseSimpleYaml(meta, ['name', 'version', 'description', 'auth'], '@arkzen:meta')
  const expectedName = path.basename(path.dirname(tatemonoPath))
  assert(metaValues.name === expectedName, `@arkzen:meta name "${metaValues.name}" must match Tatemono folder "${expectedName}"`)
  assert(/^[a-z0-9][a-z0-9-]*$/.test(metaValues.name), 'Tatemono name may contain only lowercase letters, digits, and hyphens')

  const projectBody = readBlock(source, 'unity:project')
  const project = parseSimpleYaml(projectBody, ['unity_version', 'name', 'width', 'height', 'pixels_per_unit'], '@arkzen:unity:project')
  assert(typeof project.name === 'string' && project.name.trim(), '@arkzen:unity:project name must be a non-empty string')
  assert(typeof project.unity_version === 'string' && /^\d+\.\d+\.\d+[abfp]\d+$/.test(project.unity_version), 'unity_version must be an explicit Unity editor version such as 6000.0.38f1')
  for (const key of ['width', 'height', 'pixels_per_unit']) {
    if (project[key] !== undefined) assert(Number.isInteger(project[key]) && project[key] > 0, `${key} must be a positive integer`)
  }
  project.width ??= 1280
  project.height ??= 720
  project.pixels_per_unit ??= 100

  const gameBody = readBlock(source, 'unity:game')
  const game = parseSimpleYaml(gameBody, [
    'type', 'dinosaur', 'obstacle', 'jump_key', 'gravity', 'jump_velocity', 'ground_y',
    'scroll_speed', 'spawn_interval_min', 'spawn_interval_max',
  ], '@arkzen:unity:game')
  assert(game.type === 'dino_runner', 'Unity game type must be dino_runner')
  for (const key of ['dinosaur', 'obstacle']) {
    assert(typeof game[key] === 'string' && /^[a-z][a-z0-9_-]*$/.test(game[key]), `${key} must be an asset name`)
  }
  assert(['Space', 'UpArrow', 'W', 'Z', 'Return'].includes(game.jump_key), 'jump_key must be one of Space, UpArrow, W, Z, or Return')
  for (const [key, fallback] of Object.entries({
    gravity: -30,
    jump_velocity: 12.5,
    ground_y: -2.0,
    scroll_speed: 7.5,
    spawn_interval_min: 1.1,
    spawn_interval_max: 2.0,
  })) {
    game[key] ??= fallback
    assert(Number.isFinite(game[key]), `${key} must be a finite number`)
  }
  assert(game.gravity < 0, 'gravity must be negative')
  for (const key of ['jump_velocity', 'scroll_speed', 'spawn_interval_min', 'spawn_interval_max']) {
    assert(game[key] > 0, `${key} must be positive`)
  }
  assert(game.spawn_interval_max >= game.spawn_interval_min, 'spawn_interval_max must not be less than spawn_interval_min')

  const visualsBody = readBlock(source, 'unity:visuals', false)
  const visuals = visualsBody === null
    ? {}
    : parseSimpleYaml(visualsBody, [
      'background_color', 'ground_color', 'dinosaur_tint', 'obstacle_tint',
      'camera_size', 'ground_thickness', 'ground_width', 'dinosaur_size',
      'obstacle_width', 'obstacle_height',
    ], '@arkzen:unity:visuals')
  for (const key of ['background_color', 'ground_color', 'dinosaur_tint', 'obstacle_tint']) {
    if (visuals[key] !== undefined) assert(typeof visuals[key] === 'string' && /^#[0-9a-fA-F]{6}$/.test(visuals[key]), `${key} must be a #RRGGBB color`)
  }
  for (const [key, fallback] of Object.entries({
    camera_size: 5,
    ground_thickness: 0.22,
    ground_width: 24,
    dinosaur_size: 1.75,
    obstacle_width: 0.9,
    obstacle_height: 1.25,
  })) {
    visuals[key] ??= fallback
    assert(Number.isFinite(visuals[key]) && visuals[key] > 0, `${key} must be a positive number`)
  }
  assert(visuals.camera_size <= 20, 'camera_size must not exceed 20')

  const controlsBody = readBlock(source, 'unity:controls', false)
  const controls = controlsBody === null
    ? {}
    : parseSimpleYaml(controlsBody, ['restart_key', 'pointer_enabled'], '@arkzen:unity:controls')
  controls.restart_key ??= 'R'
  controls.pointer_enabled ??= true
  assert(['R', 'Return', 'Escape', 'Backspace'].includes(controls.restart_key), 'restart_key must be one of R, Return, Escape, or Backspace')
  assert(typeof controls.pointer_enabled === 'boolean', 'pointer_enabled must be true or false')

  const assets = new Map()
  const assetsBody = readBlock(source, 'unity:assets')
  const assetPattern = /^  ([a-z][a-z0-9_-]*):\r?\n    source: ([^\r\n]+)\s*$/gm
  for (const match of assetsBody.matchAll(assetPattern)) {
    const [, name, rawSource] = match
    assert(!assets.has(name), `Duplicate Unity asset "${name}"`)
    const assetSource = rawSource.trim().replace(/^["']|["']$/g, '').replace(/\\/g, '/')
    assert(assetSource.startsWith('assets/') && !assetSource.split('/').includes('..'), `Unity asset "${name}" must stay inside assets/`)
    assert(path.posix.extname(assetSource).toLowerCase() === '.svg', `Unity asset "${name}" must be an SVG file`)
    assets.set(name, assetSource)
  }
  assert(assets.size > 0, '@arkzen:unity:assets must declare SVG assets')
  assert(assets.has(game.dinosaur), `Unity game references undeclared dinosaur asset "${game.dinosaur}"`)
  assert(assets.has(game.obstacle), `Unity game references undeclared obstacle asset "${game.obstacle}"`)

  return { meta: metaValues, project, game, visuals, controls, assets }
}

function unityString(value) {
  return JSON.stringify(String(value))
}

function unityColor(value, fallback) {
  const hex = (value ?? fallback).slice(1)
  const red = parseInt(hex.slice(0, 2), 16) / 255
  const green = parseInt(hex.slice(2, 4), 16) / 255
  const blue = parseInt(hex.slice(4, 6), 16) / 255
  return `new Color(${red.toFixed(4)}f, ${green.toFixed(4)}f, ${blue.toFixed(4)}f, 1f)`
}

function safeAssetPath(source) {
  const normalized = source.replace(/\\/g, '/')
  assert(!path.posix.isAbsolute(normalized) && !normalized.split('/').includes('..'), `Unsafe Unity asset path "${source}"`)
  return normalized
}

function writeUnityProject(model, tatemonoDir, outputDir) {
  const projectAssets = path.join(outputDir, 'Assets')
  const scriptsDir = path.join(projectAssets, 'Scripts')
  const resourcesDir = path.join(projectAssets, 'Resources')
  const scenesDir = path.join(projectAssets, 'Scenes')
  const editorDir = path.join(projectAssets, 'Editor')
  for (const directory of [scriptsDir, resourcesDir, scenesDir, editorDir, path.join(outputDir, 'Packages'), path.join(outputDir, 'ProjectSettings'), path.join(outputDir, '.github', 'workflows')]) {
    fs.mkdirSync(directory, { recursive: true })
  }

  for (const [name, assetPath] of model.assets) {
    const sourcePath = path.resolve(tatemonoDir, ...safeAssetPath(assetPath).split('/'))
    const relativeAsset = path.relative(tatemonoDir, sourcePath)
    assert(!relativeAsset.startsWith('..') && fs.existsSync(sourcePath) && fs.statSync(sourcePath).isFile(), `Required SVG asset "${name}" does not exist: ${assetPath}`)
    fs.copyFileSync(sourcePath, path.join(resourcesDir, `${name}.svg`))
  }

  const game = model.game
  const project = model.project
  const visuals = model.visuals
  const controls = model.controls
  const pointerJump = controls.pointer_enabled ? ' || Input.GetMouseButtonDown(0)' : ''
  const pointerRestart = controls.pointer_enabled ? ' || Input.GetMouseButtonDown(0)' : ''
  const runnerSource = `using UnityEngine;

public sealed class DinoRunner : MonoBehaviour
{
    const float DinosaurX = -4.1f;

    readonly Color groundColor = ${unityColor(visuals.ground_color, '#338a4f')};
    readonly Color skyColor = ${unityColor(visuals.background_color, '#b3e0f5')};
    readonly Color dinosaurTint = ${unityColor(visuals.dinosaur_tint, '#ffffff')};
    readonly Color obstacleTint = ${unityColor(visuals.obstacle_tint, '#ffffff')};
    SpriteRenderer dinosaur;
    Sprite obstacleSprite;
    float velocityY;
    float nextObstacle;
    float score;
    bool grounded;
    bool gameOver;

    void Start()
    {
        Application.targetFrameRate = 60;
        Screen.SetResolution(${project.width}, ${project.height}, false);
        SetupCamera();
        obstacleSprite = Resources.Load<Sprite>(${unityString(game.obstacle)});
        Sprite dinosaurSprite = Resources.Load<Sprite>(${unityString(game.dinosaur)});
        if (dinosaurSprite == null)
            Debug.LogError("Unity SVG importer did not load the dinosaur sprite. Check the Vector Graphics package import.");
        if (obstacleSprite == null)
            Debug.LogError("Unity SVG importer did not load the obstacle sprite. Check the Vector Graphics package import.");

        CreateSprite("Ground", null, new Vector2(0f, ${game.ground_y - visuals.ground_thickness / 2}f), new Vector2(${visuals.ground_width}f, ${visuals.ground_thickness}f), groundColor, 0);
        float svgScale = 100f / ${project.pixels_per_unit}f;
        dinosaur = CreateSprite("Dinosaur", dinosaurSprite, new Vector2(DinosaurX, ${game.ground_y + visuals.dinosaur_size / 2}f), Vector2.one * ${visuals.dinosaur_size}f * svgScale, dinosaurTint, 3);
        grounded = true;
        nextObstacle = Time.time + 1.5f;
    }

    void Update()
    {
        if (gameOver)
        {
            if (Input.GetKeyDown(KeyCode.${controls.restart_key})${pointerRestart})
                Restart();
            return;
        }

        if (grounded && (Input.GetKeyDown(KeyCode.${game.jump_key})${pointerJump}))
        {
            velocityY = ${game.jump_velocity}f;
            grounded = false;
        }

        velocityY += ${game.gravity}f * Time.deltaTime;
        dinosaur.transform.position += Vector3.up * velocityY * Time.deltaTime;
        float dinosaurFloor = ${game.ground_y + visuals.dinosaur_size / 2}f;
        if (dinosaur.transform.position.y <= dinosaurFloor)
        {
            dinosaur.transform.position = new Vector3(DinosaurX, dinosaurFloor, 0f);
            velocityY = 0f;
            grounded = true;
        }

        score += Time.deltaTime * 10f;
        if (Time.time >= nextObstacle)
        {
            SpawnObstacle();
            nextObstacle = Time.time + Random.Range(${game.spawn_interval_min}f, ${game.spawn_interval_max}f);
        }

        MoveObstacles();
    }

    void SetupCamera()
    {
        Camera camera = Camera.main;
        if (camera == null)
        {
            GameObject cameraObject = new GameObject("Main Camera");
            cameraObject.tag = "MainCamera";
            camera = cameraObject.AddComponent<Camera>();
        }
        camera.orthographic = true;
        camera.orthographicSize = ${visuals.camera_size}f;
        camera.transform.position = new Vector3(0f, 0f, -10f);
        camera.backgroundColor = skyColor;
        camera.clearFlags = CameraClearFlags.SolidColor;
    }

    Transform CreateSprite(string objectName, Sprite sprite, Vector2 position, Vector2 size, Color tint, int order)
    {
        GameObject gameObject = new GameObject(objectName);
        gameObject.transform.position = new Vector3(position.x, position.y, 0f);
        gameObject.transform.localScale = new Vector3(size.x, size.y, 1f);
        SpriteRenderer renderer = gameObject.AddComponent<SpriteRenderer>();
        renderer.sprite = sprite != null ? sprite : CreateFallbackSprite();
        renderer.color = tint;
        renderer.sortingOrder = order;
        return gameObject.transform;
    }

    Sprite CreateFallbackSprite()
    {
        Texture2D texture = new Texture2D(1, 1);
        texture.SetPixel(0, 0, Color.white);
        texture.Apply();
        return Sprite.Create(texture, new Rect(0, 0, 1, 1), new Vector2(0.5f, 0.5f), 1f);
    }

    void SpawnObstacle()
    {
        Transform obstacle = CreateSprite("Cactus", obstacleSprite, new Vector2(12f, ${game.ground_y + visuals.obstacle_height / 2}f), new Vector2(${visuals.obstacle_width}f, ${visuals.obstacle_height}f) * (100f / ${project.pixels_per_unit}f), obstacleTint, 2);
        obstacle.gameObject.tag = "Untagged";
        obstacle.gameObject.AddComponent<DinoObstacle>();
    }

    void MoveObstacles()
    {
        DinoObstacle[] obstacles = FindObjectsOfType<DinoObstacle>();
        foreach (DinoObstacle obstacle in obstacles)
        {
            obstacle.transform.position += Vector3.left * ${game.scroll_speed}f * Time.deltaTime;
            if (obstacle.transform.position.x < -14f)
                Destroy(obstacle.gameObject);

            if (dinosaur.bounds.Intersects(obstacle.GetComponent<SpriteRenderer>().bounds))
                gameOver = true;
        }
    }

    void OnGUI()
    {
        GUIStyle scoreStyle = new GUIStyle(GUI.skin.label);
        scoreStyle.fontSize = 24;
        scoreStyle.fontStyle = FontStyle.Bold;
        scoreStyle.normal.textColor = new Color(0.10f, 0.22f, 0.20f);
        GUI.Label(new Rect(24, 18, 240, 40), "SCORE  " + Mathf.FloorToInt(score).ToString("D4"), scoreStyle);

        GUIStyle hintStyle = new GUIStyle(GUI.skin.label);
        hintStyle.fontSize = 16;
        hintStyle.normal.textColor = new Color(0.10f, 0.22f, 0.20f);
        GUI.Label(new Rect(24, 56, 420, 32), "${game.jump_key}${controls.pointer_enabled ? ' / CLICK' : ''} to jump", hintStyle);

        if (gameOver)
        {
            GUIStyle titleStyle = new GUIStyle(GUI.skin.label);
            titleStyle.alignment = TextAnchor.MiddleCenter;
            titleStyle.fontSize = 42;
            titleStyle.fontStyle = FontStyle.Bold;
            titleStyle.normal.textColor = new Color(0.10f, 0.22f, 0.20f);
            GUI.Label(new Rect(0, Screen.height * 0.34f, Screen.width, 64), "GAME OVER", titleStyle);
            if (GUI.Button(new Rect(Screen.width * 0.5f - 85, Screen.height * 0.5f, 170, 48), "Play again  (${controls.restart_key})"))
                Restart();
        }
    }

    void Restart()
    {
        DinoObstacle[] obstacles = FindObjectsOfType<DinoObstacle>();
        foreach (DinoObstacle obstacle in obstacles)
            Destroy(obstacle.gameObject);
        dinosaur.transform.position = new Vector3(DinosaurX, ${game.ground_y + visuals.dinosaur_size / 2}f, 0f);
        velocityY = 0f;
        score = 0f;
        gameOver = false;
        grounded = true;
        nextObstacle = Time.time + 1f;
    }
}

public sealed class DinoObstacle : MonoBehaviour { }
`
  fs.writeFileSync(path.join(scriptsDir, 'DinoRunner.cs'), runnerSource, 'utf8')
  fs.writeFileSync(path.join(scriptsDir, 'DinoRunner.cs.meta'), `fileFormatVersion: 2\nguid: 7f5a48c11a654fd1a5b60123456789ab\nMonoImporter:\n  externalObjects: {}\n  serializedVersion: 2\n  defaultReferences: []\n  executionOrder: 0\n  icon: {instanceID: 0}\n  userData:\n  assetBundleName:\n  assetBundleVariant:\n`, 'utf8')
  fs.writeFileSync(path.join(scenesDir, 'Main.unity'), sceneFile(), 'utf8')
  fs.writeFileSync(path.join(scenesDir, 'Main.unity.meta'), `fileFormatVersion: 2\nguid: 9e0cd128c9c04b2692515e246789abcd\nDefaultImporter:\n  externalObjects: {}\n  userData:\n  assetBundleName:\n  assetBundleVariant:\n`, 'utf8')

  fs.writeFileSync(path.join(outputDir, 'Packages', 'manifest.json'), JSON.stringify({
    dependencies: {
      'com.unity.modules.imgui': '1.0.0',
      'com.unity.modules.physics2d': '1.0.0',
      'com.unity.modules.ui': '1.0.0',
      'com.unity.vectorgraphics': VECTOR_GRAPHICS_VERSION,
    },
  }, null, 2) + '\n', 'utf8')
  fs.writeFileSync(path.join(outputDir, 'ProjectSettings', 'ProjectVersion.txt'), `m_EditorVersion: ${project.unity_version}\n`, 'utf8')
  fs.writeFileSync(path.join(outputDir, 'ProjectSettings', 'EditorBuildSettings.asset'), buildSettings(), 'utf8')
  fs.writeFileSync(path.join(outputDir, '.gitignore'), 'Library/\nTemp/\nObj/\nBuild/\nLogs/\nUserSettings/\n.vs/\n*.csproj\n*.sln\n', 'utf8')
  fs.writeFileSync(path.join(outputDir, 'README.md'), projectReadme(model), 'utf8')
  fs.writeFileSync(path.join(outputDir, 'Assets', 'Editor', 'PluffBuild.cs'), buildScript(), 'utf8')
  fs.writeFileSync(path.join(outputDir, 'Assets', 'Editor', 'PluffBuild.cs.meta'), `fileFormatVersion: 2\nguid: 3a5f8c11a6544fd1b5b60123456789ab\nMonoImporter:\n  externalObjects: {}\n  serializedVersion: 2\n  defaultReferences: []\n  executionOrder: 0\n  icon: {instanceID: 0}\n  userData:\n  assetBundleName:\n  assetBundleVariant:\n`, 'utf8')
  fs.writeFileSync(path.join(outputDir, '.github', 'workflows', 'unity-build.yml'), workflowFile(project.unity_version), 'utf8')
}

function sceneFile() {
  return `%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!29 &1
OcclusionCullingSettings:
  m_ObjectHideFlags: 0
  serializedVersion: 2
  m_OcclusionBakeSettings:
    smallestOccluder: 5
    smallestHole: 0.25
    backfaceThreshold: 100
  m_SceneGUID: 00000000000000000000000000000000
  m_OcclusionCullingData: {fileID: 0}
--- !u!104 &2
RenderSettings:
  m_ObjectHideFlags: 0
  serializedVersion: 9
  m_Fog: 0
  m_AmbientSkyColor: {r: 0.2, g: 0.22, b: 0.25, a: 1}
  m_AmbientEquatorColor: {r: 0.11, g: 0.12, b: 0.14, a: 1}
  m_AmbientGroundColor: {r: 0.05, g: 0.05, b: 0.05, a: 1}
  m_AmbientIntensity: 1
  m_DefaultReflectionMode: 0
  m_DefaultReflectionResolution: 128
  m_ReflectionBounces: 1
  m_ReflectionIntensity: 1
  m_CustomReflection: {fileID: 0}
  m_Sun: {fileID: 0}
  m_IndirectSpecularColor: {r: 0.18, g: 0.18, b: 0.18, a: 1}
  m_UseRadianceAmbientProbe: 0
--- !u!157 &3
LightmapSettings:
  m_ObjectHideFlags: 0
  serializedVersion: 12
  m_GIWorkflowMode: 1
  m_GISettings:
    serializedVersion: 2
    m_BounceScale: 1
    m_IndirectOutputScale: 1
    m_AlbedoBoost: 1
    m_EnvironmentLightingMode: 0
    m_EnableBakedLightmaps: 0
    m_EnableRealtimeLightmaps: 0
  m_LightingSettings: {fileID: 0}
--- !u!196 &4
NavMeshSettings:
  serializedVersion: 2
  m_ObjectHideFlags: 0
  m_BuildSettings:
    serializedVersion: 3
    agentTypeID: 0
    agentRadius: 0.5
    agentHeight: 2
    agentSlope: 45
    agentClimb: 0.4
    ledgeDropHeight: 0
    maxJumpAcrossDistance: 0
    minRegionArea: 2
    manualCellSize: 0
    cellSize: 0.16666667
    manualTileSize: 0
    tileSize: 256
    accuratePlacement: 0
    debug:
      m_Flags: 0
  m_NavMeshData: {fileID: 0}
--- !u!1 &1000
GameObject:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  serializedVersion: 6
  m_Component:
  - component: {fileID: 1001}
  - component: {fileID: 1002}
  m_Layer: 0
  m_Name: DinoRunner
  m_TagString: Untagged
  m_Icon: {fileID: 0}
  m_NavMeshLayer: 0
  m_StaticEditorFlags: 0
  m_IsActive: 1
--- !u!4 &1001
Transform:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_GameObject: {fileID: 1000}
  serializedVersion: 2
  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}
  m_LocalPosition: {x: 0, y: 0, z: 0}
  m_LocalScale: {x: 1, y: 1, z: 1}
  m_ConstrainProportionsScale: 0
  m_Children: []
  m_Father: {fileID: 0}
  m_LocalEulerAnglesHint: {x: 0, y: 0, z: 0}
--- !u!114 &1002
MonoBehaviour:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_GameObject: {fileID: 1000}
  m_Enabled: 1
  m_EditorHideFlags: 0
  m_Script: {fileID: 11500000, guid: 7f5a48c11a654fd1a5b60123456789ab, type: 3}
  m_Name:
  m_EditorClassIdentifier:
`
}

function buildSettings() {
  return `%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!1045 &1
EditorBuildSettings:
  m_ObjectHideFlags: 0
  serializedVersion: 2
  m_Scenes:
  - enabled: 1
    path: Assets/Scenes/Main.unity
    guid: 9e0cd128c9c04b2692515e246789abcd
  m_configObjects: {}
`
}

function buildScript() {
  return `using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

public static class PluffBuild
{
    public static void BuildWindows()
    {
        string output = Path.GetFullPath("Build/Windows/DinoRunner.exe");
        Directory.CreateDirectory(Path.GetDirectoryName(output));
        BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
        {
            scenes = new[] { "Assets/Scenes/Main.unity" },
            locationPathName = output,
            target = BuildTarget.StandaloneWindows64,
            options = BuildOptions.None
        });

        if (report.summary.result != BuildResult.Succeeded)
            throw new System.Exception("Unity Windows build failed: " + report.summary.result);

        Debug.Log("Pluff Windows build created: " + output);
    }
}
`
}

function projectReadme(model) {
  return `# ${model.project.name}

Generated Unity ${model.project.unity_version} 2D dinosaur runner.

## Open and play

Open this folder in the matching Unity Editor version and let Package Manager
install the Vector Graphics package. Open \`Assets/Scenes/Main.unity\` and press
Play. Jump with **${model.game.jump_key}**${model.controls.pointer_enabled ? ' or click/tap' : ''}. Press
**${model.controls.restart_key}**${model.controls.pointer_enabled ? ' or click' : ''} to restart after a collision.

The dinosaur and cactus are SVG source assets imported as sprites by
\`com.unity.vectorgraphics\`. Do not delete the package dependency or the source
files in \`Assets/Resources/\`.

## Build

Install the Windows Standalone Build Support module, then run:

\`\`\`sh
Unity -batchmode -quit -projectPath . -executeMethod PluffBuild.BuildWindows -logFile -
\`\`\`

The executable is written to \`Build/Windows/DinoRunner.exe\`.

The generated \`.github/workflows/unity-build.yml\` can build this project with
GameCI. Add your Unity license as the repository secret \`UNITY_LICENSE\`; see
GameCI's license activation documentation before using the workflow. This
runner's headless editor import and build have not been tested on the generator
machine because Unity Editor is not installed there.
`
}

function workflowFile(unityVersion) {
  return `name: Unity build

on:
  workflow_dispatch:
  push:
    paths:
      - "Assets/**"
      - "Packages/**"
      - "ProjectSettings/**"
      - ".github/workflows/unity-build.yml"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: game-ci/unity-builder@v4
        env:
          UNITY_LICENSE: \${{ secrets.UNITY_LICENSE }}
        with:
          projectPath: .
          unityVersion: ${unityVersion}
          targetPlatform: StandaloneWindows64
          buildsPath: build
      - uses: actions/upload-artifact@v4
        with:
          name: dino-runner-windows
          path: build
`
}

function isWithin(parent, target) {
  const relative = path.relative(parent, target)
  return relative !== '' && !relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative)
}

export function generateUnityProject({ tatemonoPath, outputDir }) {
  const absoluteTatemonoPath = path.resolve(tatemonoPath)
  const absoluteOutputPath = path.resolve(outputDir)
  assert(fs.existsSync(absoluteTatemonoPath) && fs.statSync(absoluteTatemonoPath).isFile(), `Tatemono file does not exist: ${absoluteTatemonoPath}`)
  assert(path.basename(absoluteTatemonoPath) === 'core.tsx', 'Unity generation expects a Tatemono core.tsx file')
  const tatemonoDir = path.dirname(absoluteTatemonoPath)
  assert(absoluteOutputPath !== tatemonoDir && !isWithin(tatemonoDir, absoluteOutputPath), 'Unity output directory cannot be inside the source Tatemono folder')
  assert(!isWithin(absoluteOutputPath, absoluteTatemonoPath), 'Unity output directory cannot contain the source Tatemono file')

  const source = fs.readFileSync(absoluteTatemonoPath, 'utf8')
  const sceneMode = /^\s*\/\* @arkzen:unity:scene:/m.test(source)
  const model = sceneMode
    ? parseUnitySceneTatemono(source, absoluteTatemonoPath)
    : parseUnityTatemono(source, absoluteTatemonoPath)
  validateGameFreeFiles(source, 'Unity generator')
  fs.mkdirSync(path.dirname(absoluteOutputPath), { recursive: true })
  const stagingDir = fs.mkdtempSync(path.join(path.dirname(absoluteOutputPath), `.${path.basename(absoluteOutputPath)}-staging-`))
  let generated
  let freeFiles
  try {
    generated = sceneMode
      ? writeUnitySceneProject(model, tatemonoDir, stagingDir)
      : (writeUnityProject(model, tatemonoDir, stagingDir), {
        scene: 'Assets/Scenes/Main.unity',
        copiedAssetCount: model.assets.size,
      })
    // @arkzen:file blocks go last so they can add to or replace anything generated above.
    freeFiles = writeGameFreeFiles(source, stagingDir, 'Unity generator')
    const backupDir = `${absoluteOutputPath}.previous-${process.pid}`
    if (fs.existsSync(backupDir)) fs.rmSync(backupDir, { recursive: true, force: true })
    if (fs.existsSync(absoluteOutputPath)) fs.renameSync(absoluteOutputPath, backupDir)
    try {
      fs.renameSync(stagingDir, absoluteOutputPath)
    } catch (error) {
      if (fs.existsSync(backupDir)) fs.renameSync(backupDir, absoluteOutputPath)
      throw error
    }
    if (fs.existsSync(backupDir)) fs.rmSync(backupDir, { recursive: true, force: true })
  } catch (error) {
    if (fs.existsSync(stagingDir)) fs.rmSync(stagingDir, { recursive: true, force: true })
    throw error
  }

  return {
    outputDir: absoluteOutputPath,
    scene: generated.scene,
    copiedAssetCount: generated.copiedAssetCount,
    unityVersion: model.project.unity_version,
    freeFiles,
  }
}
