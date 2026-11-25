// ============================================================
// PLUFF UNREAL C++ RUNTIME v1.0
//
// Source templates for the generated Unreal project. Unreal levels (.umap) and
// Blueprints are binary, so Pluff does not generate them. Instead the project
// ships a small C++ runtime that reads Content/PluffScenes/<scene>.json when the
// game starts and spawns everything (meshes, lights, camera, player, fog) into
// the engine's built-in empty map. The generator does all unit/axis conversion;
// this code only reads finished Unreal-space numbers (centimeters, quaternions).
//
// Every template takes the module name; "<MODULE>_API" is the export macro that
// Unreal Header Tool expects for a module with that name.
// ============================================================

const apiMacro = moduleName => `${moduleName.toUpperCase()}_API`

export function targetCs(moduleName) {
  return `using UnrealBuildTool;
using System.Collections.Generic;

public class ${moduleName}Target : TargetRules
{
    public ${moduleName}Target(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Game;
        DefaultBuildSettings = BuildSettingsVersion.Latest;
        IncludeOrderVersion = EngineIncludeOrderVersion.Latest;
        ExtraModuleNames.Add("${moduleName}");
    }
}
`
}

export function editorTargetCs(moduleName) {
  return `using UnrealBuildTool;
using System.Collections.Generic;

public class ${moduleName}EditorTarget : TargetRules
{
    public ${moduleName}EditorTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Editor;
        DefaultBuildSettings = BuildSettingsVersion.Latest;
        IncludeOrderVersion = EngineIncludeOrderVersion.Latest;
        ExtraModuleNames.Add("${moduleName}");
    }
}
`
}

export function buildCs(moduleName) {
  return `using UnrealBuildTool;

public class ${moduleName} : ModuleRules
{
    public ${moduleName}(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

        PublicDependencyModuleNames.AddRange(new string[]
        {
            "Core",
            "CoreUObject",
            "Engine",
            "InputCore",
            "Json"
        });
    }
}
`
}

export function moduleHeader(moduleName) {
  return `#pragma once

#include "CoreMinimal.h"
`
}

export function moduleSource(moduleName) {
  return `#include "${moduleName}.h"
#include "Modules/ModuleManager.h"

IMPLEMENT_PRIMARY_GAME_MODULE(FDefaultGameModuleImpl, ${moduleName}, "${moduleName}");
`
}

export function componentsHeader(moduleName) {
  const api = apiMacro(moduleName)
  return `#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "PluffComponents.generated.h"

// Spins its owner around a local axis (the "rotate" component).
UCLASS()
class ${api} UPluffRotateComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UPluffRotateComponent();

    virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

    // Rotation axis in Unreal space. Normalized every tick.
    FVector Axis = FVector(0.0, 0.0, 1.0);
    float DegreesPerSecond = 45.0f;
};

// Smoothly follows a target actor and looks at it (the "camera_follow" component).
UCLASS()
class ${api} UPluffCameraFollowComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UPluffCameraFollowComponent();

    virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

    TWeakObjectPtr<AActor> Target;
    // World-space offset from the target, in centimeters.
    FVector Offset = FVector::ZeroVector;
    float SmoothSpeed = 8.0f;
};
`
}

export function componentsSource(moduleName) {
  return `#include "PluffComponents.h"

#include "GameFramework/Actor.h"
#include "Kismet/KismetMathLibrary.h"

UPluffRotateComponent::UPluffRotateComponent()
{
    PrimaryComponentTick.bCanEverTick = true;
}

void UPluffRotateComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
    Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

    AActor* Owner = GetOwner();
    if (!Owner || Axis.IsNearlyZero())
    {
        return;
    }

    const FQuat Delta(Axis.GetSafeNormal(), FMath::DegreesToRadians(DegreesPerSecond * DeltaTime));
    Owner->AddActorLocalRotation(Delta);
}

UPluffCameraFollowComponent::UPluffCameraFollowComponent()
{
    PrimaryComponentTick.bCanEverTick = true;
}

void UPluffCameraFollowComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
    Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

    AActor* Owner = GetOwner();
    if (!Owner || !Target.IsValid())
    {
        return;
    }

    const FVector TargetLocation = Target->GetActorLocation();
    const FVector Desired = TargetLocation + Offset;
    const FVector Next = FMath::VInterpTo(Owner->GetActorLocation(), Desired, DeltaTime, SmoothSpeed);
    Owner->SetActorLocation(Next);
    Owner->SetActorRotation(UKismetMathLibrary::FindLookAtRotation(Next, TargetLocation));
}
`
}

export function characterHeader(moduleName) {
  const api = apiMacro(moduleName)
  return `#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "InputCoreTypes.h"
#include "PluffCharacter.generated.h"

// The player (the "character_controller" component). Keys are polled every tick so
// no input mapping assets are needed.
UCLASS()
class ${api} APluffCharacter : public ACharacter
{
    GENERATED_BODY()

public:
    APluffCharacter();

    virtual void Tick(float DeltaSeconds) override;

    void ConfigureShape(float Radius, float HalfHeight);
    void ConfigureMovement(float SpeedCm, float JumpHeightCm, float GravityScaleValue, bool bInCameraRelative);
    void ConfigureKeys(const FKey& Forward, const FKey& Backward, const FKey& Left, const FKey& Right, const FKey& Jump);

    // Movement is relative to this actor's yaw when camera-relative movement is on.
    TWeakObjectPtr<AActor> ViewReference;

private:
    FKey ForwardKey;
    FKey BackwardKey;
    FKey LeftKey;
    FKey RightKey;
    FKey JumpKey;
    bool bCameraRelative = false;
};
`
}

export function characterSource(moduleName) {
  return `#include "PluffCharacter.h"

#include "Components/CapsuleComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "GameFramework/PlayerController.h"
#include "Math/RotationMatrix.h"

APluffCharacter::APluffCharacter()
{
    PrimaryActorTick.bCanEverTick = true;

    bUseControllerRotationPitch = false;
    bUseControllerRotationYaw = false;
    bUseControllerRotationRoll = false;

    UCharacterMovementComponent* MovementComponent = GetCharacterMovement();
    MovementComponent->bOrientRotationToMovement = true;
    MovementComponent->RotationRate = FRotator(0.0f, 540.0f, 0.0f);

    ForwardKey = EKeys::W;
    BackwardKey = EKeys::S;
    LeftKey = EKeys::A;
    RightKey = EKeys::D;
    JumpKey = EKeys::SpaceBar;
}

void APluffCharacter::ConfigureShape(float Radius, float HalfHeight)
{
    GetCapsuleComponent()->SetCapsuleSize(Radius, FMath::Max(HalfHeight, Radius));
}

void APluffCharacter::ConfigureMovement(float SpeedCm, float JumpHeightCm, float GravityScaleValue, bool bInCameraRelative)
{
    UCharacterMovementComponent* MovementComponent = GetCharacterMovement();
    MovementComponent->MaxWalkSpeed = SpeedCm;
    MovementComponent->GravityScale = GravityScaleValue;

    // v = sqrt(2 * g * h), with g = 980 cm/s^2 * gravity scale.
    const float Gravity = 980.0f * GravityScaleValue;
    MovementComponent->JumpZVelocity = FMath::Sqrt(2.0f * Gravity * FMath::Max(JumpHeightCm, 0.0f));

    bCameraRelative = bInCameraRelative;
}

void APluffCharacter::ConfigureKeys(const FKey& Forward, const FKey& Backward, const FKey& Left, const FKey& Right, const FKey& Jump)
{
    ForwardKey = Forward;
    BackwardKey = Backward;
    LeftKey = Left;
    RightKey = Right;
    JumpKey = Jump;
}

void APluffCharacter::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);

    APlayerController* PlayerController = Cast<APlayerController>(GetController());
    if (!PlayerController)
    {
        return;
    }

    float Forward = 0.0f;
    float Right = 0.0f;
    if (PlayerController->IsInputKeyDown(ForwardKey)) { Forward += 1.0f; }
    if (PlayerController->IsInputKeyDown(BackwardKey)) { Forward -= 1.0f; }
    if (PlayerController->IsInputKeyDown(RightKey)) { Right += 1.0f; }
    if (PlayerController->IsInputKeyDown(LeftKey)) { Right -= 1.0f; }

    if (PlayerController->WasInputKeyJustPressed(JumpKey))
    {
        Jump();
    }
    if (PlayerController->WasInputKeyJustReleased(JumpKey))
    {
        StopJumping();
    }

    FRotator YawOnly = FRotator::ZeroRotator;
    if (bCameraRelative && ViewReference.IsValid())
    {
        YawOnly.Yaw = ViewReference->GetActorRotation().Yaw;
    }

    const FRotationMatrix YawMatrix(YawOnly);
    const FVector Direction = YawMatrix.GetUnitAxis(EAxis::X) * Forward + YawMatrix.GetUnitAxis(EAxis::Y) * Right;
    if (!Direction.IsNearlyZero())
    {
        AddMovementInput(Direction.GetSafeNormal(), 1.0f);
    }
}
`
}

export function gameModeHeader(moduleName) {
  const api = apiMacro(moduleName)
  return `#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "PluffGameMode.generated.h"

class AActor;
class APluffCharacter;
class ASkyLight;
class FJsonObject;
class UMaterialInterface;
class UPluffCameraFollowComponent;
class UStaticMesh;
class UStaticMeshComponent;

struct FPluffPendingFollow
{
    TWeakObjectPtr<UPluffCameraFollowComponent> Component;
    FString TargetName;
};

// Reads Content/PluffScenes/<scene>.json and builds the scene when the game starts.
// Pass -PluffScene=<name> on the command line to start a different declared scene.
UCLASS()
class ${api} APluffGameMode : public AGameModeBase
{
    GENERATED_BODY()

public:
    APluffGameMode();

    virtual void BeginPlay() override;

private:
    bool LoadSceneFile(const FString& SceneKey, TSharedPtr<FJsonObject>& OutScene) const;
    void BuildEnvironment(const TSharedPtr<FJsonObject>& Scene);
    AActor* SpawnNode(const TSharedPtr<FJsonObject>& Node, AActor* Parent);
    UStaticMesh* MeshForType(const FString& Type) const;
    void ApplyColor(UStaticMeshComponent* Mesh, const FString& Hex);
    void ResolveFollowTargets();
    void ShowError(const FString& Message) const;

    UPROPERTY()
    TObjectPtr<UStaticMesh> CubeMesh;

    UPROPERTY()
    TObjectPtr<UStaticMesh> SphereMesh;

    UPROPERTY()
    TObjectPtr<UStaticMesh> CylinderMesh;

    UPROPERTY()
    TObjectPtr<UStaticMesh> ConeMesh;

    UPROPERTY()
    TObjectPtr<UStaticMesh> PlaneMesh;

    UPROPERTY()
    TObjectPtr<UMaterialInterface> ShapeMaterial;

    TMap<FString, TWeakObjectPtr<AActor>> SpawnedByName;
    TArray<FPluffPendingFollow> PendingFollows;
    TWeakObjectPtr<AActor> MainCamera;
    TWeakObjectPtr<APluffCharacter> Player;
    TWeakObjectPtr<ASkyLight> SkyLightActor;
};
`
}

export function gameModeSource(moduleName, mainScene) {
  return `#include "PluffGameMode.h"

#include "PluffCharacter.h"
#include "PluffComponents.h"

#include "Camera/CameraActor.h"
#include "Camera/CameraComponent.h"
#include "Components/ExponentialHeightFogComponent.h"
#include "Components/PointLightComponent.h"
#include "Components/SceneComponent.h"
#include "Components/SkyLightComponent.h"
#include "Components/SpotLightComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Dom/JsonObject.h"
#include "Dom/JsonValue.h"
#include "Engine/DirectionalLight.h"
#include "Engine/Engine.h"
#include "Engine/ExponentialHeightFog.h"
#include "Engine/Light.h"
#include "Engine/PointLight.h"
#include "Engine/SkyLight.h"
#include "Engine/SpotLight.h"
#include "Engine/StaticMesh.h"
#include "Engine/StaticMeshActor.h"
#include "Engine/World.h"
#include "GameFramework/PlayerController.h"
#include "InputCoreTypes.h"
#include "Kismet/GameplayStatics.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Misc/CommandLine.h"
#include "Misc/FileHelper.h"
#include "Misc/Parse.h"
#include "Misc/Paths.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"
#include "UObject/ConstructorHelpers.h"

DEFINE_LOG_CATEGORY_STATIC(LogPluff, Log, All);

namespace
{
    // Scene started when no -PluffScene=<name> is given (the project's main_scene).
    const TCHAR* const MainSceneKey = TEXT("${mainScene}");

    double ReadNumber(const TSharedPtr<FJsonObject>& Object, const TCHAR* Field, double Default)
    {
        double Value = Default;
        if (Object.IsValid() && Object->TryGetNumberField(Field, Value))
        {
            return Value;
        }
        return Default;
    }

    FString ReadString(const TSharedPtr<FJsonObject>& Object, const TCHAR* Field, const FString& Default)
    {
        FString Value;
        if (Object.IsValid() && Object->TryGetStringField(Field, Value))
        {
            return Value;
        }
        return Default;
    }

    bool ReadBool(const TSharedPtr<FJsonObject>& Object, const TCHAR* Field, bool Default)
    {
        bool Value = Default;
        if (Object.IsValid() && Object->TryGetBoolField(Field, Value))
        {
            return Value;
        }
        return Default;
    }

    bool ReadVector(const TSharedPtr<FJsonObject>& Object, const TCHAR* Field, FVector& Out)
    {
        const TArray<TSharedPtr<FJsonValue>>* Array = nullptr;
        if (Object.IsValid() && Object->TryGetArrayField(Field, Array) && Array && Array->Num() == 3)
        {
            Out = FVector((*Array)[0]->AsNumber(), (*Array)[1]->AsNumber(), (*Array)[2]->AsNumber());
            return true;
        }
        return false;
    }

    bool ReadQuat(const TSharedPtr<FJsonObject>& Object, const TCHAR* Field, FQuat& Out)
    {
        const TArray<TSharedPtr<FJsonValue>>* Array = nullptr;
        if (Object.IsValid() && Object->TryGetArrayField(Field, Array) && Array && Array->Num() == 4)
        {
            Out = FQuat((*Array)[0]->AsNumber(), (*Array)[1]->AsNumber(), (*Array)[2]->AsNumber(), (*Array)[3]->AsNumber());
            Out.Normalize();
            return true;
        }
        return false;
    }

    TSharedPtr<FJsonObject> ReadObject(const TSharedPtr<FJsonObject>& Object, const TCHAR* Field)
    {
        const TSharedPtr<FJsonObject>* Child = nullptr;
        if (Object.IsValid() && Object->TryGetObjectField(Field, Child) && Child)
        {
            return *Child;
        }
        return nullptr;
    }

    TSharedPtr<FJsonObject> AsObject(const TSharedPtr<FJsonValue>& Value)
    {
        if (Value.IsValid())
        {
            return Value->AsObject();
        }
        return nullptr;
    }

    TSharedPtr<FJsonObject> FindComponent(const TSharedPtr<FJsonObject>& Node, const TCHAR* Type)
    {
        const TArray<TSharedPtr<FJsonValue>>* Components = nullptr;
        if (Node.IsValid() && Node->TryGetArrayField(TEXT("components"), Components) && Components)
        {
            for (const TSharedPtr<FJsonValue>& Value : *Components)
            {
                const TSharedPtr<FJsonObject> Component = AsObject(Value);
                if (Component.IsValid() && ReadString(Component, TEXT("type"), FString()) == Type)
                {
                    return Component;
                }
            }
        }
        return nullptr;
    }

    // "#RRGGBB" (sRGB) to the linear color Unreal materials and lights expect.
    FLinearColor ColorFromHex(const FString& Hex)
    {
        return FLinearColor::FromSRGBColor(FColor::FromHex(Hex));
    }
}

APluffGameMode::APluffGameMode()
{
    // The scene spawns and possesses the player itself.
    DefaultPawnClass = nullptr;

    // Hard references so the cooker packages these engine assets.
    static ConstructorHelpers::FObjectFinder<UStaticMesh> CubeFinder(TEXT("/Engine/BasicShapes/Cube.Cube"));
    static ConstructorHelpers::FObjectFinder<UStaticMesh> SphereFinder(TEXT("/Engine/BasicShapes/Sphere.Sphere"));
    static ConstructorHelpers::FObjectFinder<UStaticMesh> CylinderFinder(TEXT("/Engine/BasicShapes/Cylinder.Cylinder"));
    static ConstructorHelpers::FObjectFinder<UStaticMesh> ConeFinder(TEXT("/Engine/BasicShapes/Cone.Cone"));
    static ConstructorHelpers::FObjectFinder<UStaticMesh> PlaneFinder(TEXT("/Engine/BasicShapes/Plane.Plane"));
    static ConstructorHelpers::FObjectFinder<UMaterialInterface> MaterialFinder(TEXT("/Engine/BasicShapes/BasicShapeMaterial.BasicShapeMaterial"));

    if (CubeFinder.Succeeded()) { CubeMesh = CubeFinder.Object; }
    if (SphereFinder.Succeeded()) { SphereMesh = SphereFinder.Object; }
    if (CylinderFinder.Succeeded()) { CylinderMesh = CylinderFinder.Object; }
    if (ConeFinder.Succeeded()) { ConeMesh = ConeFinder.Object; }
    if (PlaneFinder.Succeeded()) { PlaneMesh = PlaneFinder.Object; }
    if (MaterialFinder.Succeeded()) { ShapeMaterial = MaterialFinder.Object; }
}

void APluffGameMode::ShowError(const FString& Message) const
{
    UE_LOG(LogPluff, Error, TEXT("%s"), *Message);
    if (GEngine)
    {
        GEngine->AddOnScreenDebugMessage(-1, 30.0f, FColor::Red, Message);
    }
}

UStaticMesh* APluffGameMode::MeshForType(const FString& Type) const
{
    if (Type == TEXT("cube")) { return CubeMesh; }
    if (Type == TEXT("sphere")) { return SphereMesh; }
    if (Type == TEXT("cylinder")) { return CylinderMesh; }
    if (Type == TEXT("cone")) { return ConeMesh; }
    if (Type == TEXT("plane")) { return PlaneMesh; }
    return nullptr;
}

bool APluffGameMode::LoadSceneFile(const FString& SceneKey, TSharedPtr<FJsonObject>& OutScene) const
{
    if (SceneKey.IsEmpty() || SceneKey.Contains(TEXT("/")) || SceneKey.Contains(TEXT("\\\\")) || SceneKey.Contains(TEXT("..")))
    {
        ShowError(FString::Printf(TEXT("Invalid Pluff scene name: %s"), *SceneKey));
        return false;
    }

    const FString Path = FPaths::Combine(FPaths::ProjectContentDir(), TEXT("PluffScenes"), SceneKey + TEXT(".json"));
    FString Text;
    if (!FFileHelper::LoadFileToString(Text, *Path))
    {
        ShowError(FString::Printf(TEXT("Pluff scene file not found: %s"), *Path));
        return false;
    }

    const TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(Text);
    if (!FJsonSerializer::Deserialize(Reader, OutScene) || !OutScene.IsValid())
    {
        ShowError(FString::Printf(TEXT("Pluff scene file is not valid JSON: %s"), *Path));
        return false;
    }
    return true;
}

void APluffGameMode::BeginPlay()
{
    Super::BeginPlay();

    FString SceneKey = MainSceneKey;
    FParse::Value(FCommandLine::Get(), TEXT("PluffScene="), SceneKey);

    TSharedPtr<FJsonObject> Scene;
    if (!LoadSceneFile(SceneKey, Scene))
    {
        return;
    }

    APlayerController* PlayerController = UGameplayStatics::GetPlayerController(this, 0);
    if (PlayerController)
    {
        // The scene picks the view target itself.
        PlayerController->bAutoManageActiveCameraTarget = false;
    }

    BuildEnvironment(Scene);

    const TArray<TSharedPtr<FJsonValue>>* Nodes = nullptr;
    if (Scene->TryGetArrayField(TEXT("nodes"), Nodes) && Nodes)
    {
        for (const TSharedPtr<FJsonValue>& Value : *Nodes)
        {
            const TSharedPtr<FJsonObject> Node = AsObject(Value);
            if (Node.IsValid())
            {
                SpawnNode(Node, nullptr);
            }
        }
    }

    ResolveFollowTargets();

    if (Player.IsValid())
    {
        Player->ViewReference = MainCamera;
        if (PlayerController)
        {
            PlayerController->Possess(Player.Get());
        }
    }
    if (PlayerController && MainCamera.IsValid())
    {
        PlayerController->SetViewTarget(MainCamera.Get());
    }
    if (SkyLightActor.IsValid() && SkyLightActor->GetLightComponent())
    {
        SkyLightActor->GetLightComponent()->RecaptureSky();
    }

    UE_LOG(LogPluff, Log, TEXT("Pluff scene \\"%s\\" built."), *SceneKey);
}

void APluffGameMode::BuildEnvironment(const TSharedPtr<FJsonObject>& Scene)
{
    UWorld* World = GetWorld();
    const TSharedPtr<FJsonObject> Environment = ReadObject(Scene, TEXT("environment"));
    if (!World || !Environment.IsValid())
    {
        return;
    }

    const TSharedPtr<FJsonObject> Ambient = ReadObject(Environment, TEXT("ambient"));
    if (Ambient.IsValid())
    {
        ASkyLight* SkyActor = World->SpawnActor<ASkyLight>(ASkyLight::StaticClass(), FTransform::Identity);
        if (SkyActor && SkyActor->GetLightComponent())
        {
            USkyLightComponent* SkyComponent = SkyActor->GetLightComponent();
            SkyComponent->SetMobility(EComponentMobility::Movable);
            SkyComponent->SetIntensity(static_cast<float>(ReadNumber(Ambient, TEXT("intensity"), 1.0)));
            SkyComponent->SetLightColor(ColorFromHex(ReadString(Ambient, TEXT("color"), TEXT("#ffffff"))));
            SkyLightActor = SkyActor;
        }
    }

    const TSharedPtr<FJsonObject> Fog = ReadObject(Environment, TEXT("fog"));
    if (Fog.IsValid())
    {
        AExponentialHeightFog* FogActor = World->SpawnActor<AExponentialHeightFog>(AExponentialHeightFog::StaticClass(), FTransform::Identity);
        if (FogActor && FogActor->GetComponent())
        {
            UExponentialHeightFogComponent* FogComponent = FogActor->GetComponent();
            FogComponent->SetFogDensity(static_cast<float>(ReadNumber(Fog, TEXT("density"), 0.02)));
            const FString FogColor = ReadString(Fog, TEXT("color"), FString());
            if (!FogColor.IsEmpty())
            {
                FogComponent->SetFogInscatteringColor(ColorFromHex(FogColor));
            }
        }
    }
}

void APluffGameMode::ApplyColor(UStaticMeshComponent* Mesh, const FString& Hex)
{
    if (!Mesh || Hex.IsEmpty() || !ShapeMaterial)
    {
        return;
    }

    UMaterialInstanceDynamic* Material = UMaterialInstanceDynamic::Create(ShapeMaterial, Mesh);
    if (!Material)
    {
        return;
    }

    // The engine's BasicShapeMaterial exposes its tint as "Color"; "BaseColor" covers
    // a replacement material that follows the usual naming.
    const FLinearColor Color = ColorFromHex(Hex);
    Material->SetVectorParameterValue(TEXT("Color"), Color);
    Material->SetVectorParameterValue(TEXT("BaseColor"), Color);
    Mesh->SetMaterial(0, Material);
}

AActor* APluffGameMode::SpawnNode(const TSharedPtr<FJsonObject>& Node, AActor* Parent)
{
    UWorld* World = GetWorld();
    if (!World || !Node.IsValid())
    {
        return nullptr;
    }

    const FString Name = ReadString(Node, TEXT("name"), TEXT("Node"));
    const FString Type = ReadString(Node, TEXT("type"), TEXT("empty"));
    const FString Color = ReadString(Node, TEXT("color"), FString());

    FVector Location = FVector::ZeroVector;
    FVector Scale = FVector::OneVector;
    FQuat Rotation = FQuat::Identity;
    ReadVector(Node, TEXT("location"), Location);
    ReadVector(Node, TEXT("scale"), Scale);
    ReadQuat(Node, TEXT("rotation"), Rotation);

    const TSharedPtr<FJsonObject> CharacterSpec = FindComponent(Node, TEXT("character_controller"));
    const TSharedPtr<FJsonObject> PhysicsSpec = FindComponent(Node, TEXT("physics"));
    const TSharedPtr<FJsonObject> RotateSpec = FindComponent(Node, TEXT("rotate"));
    const TSharedPtr<FJsonObject> FollowSpec = FindComponent(Node, TEXT("camera_follow"));

    FActorSpawnParameters SpawnParams;
    SpawnParams.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;

    // Top-level nodes spawn in world space; children are attached and positioned below.
    FTransform SpawnTransform = FTransform::Identity;
    if (!Parent)
    {
        SpawnTransform = FTransform(Rotation, Location);
    }

    AActor* Actor = nullptr;
    UStaticMeshComponent* MeshComponent = nullptr;

    if (CharacterSpec.IsValid())
    {
        APluffCharacter* Pawn = World->SpawnActor<APluffCharacter>(APluffCharacter::StaticClass(), SpawnTransform, SpawnParams);
        if (Pawn)
        {
            const float Radius = 50.0f * static_cast<float>(FMath::Max(Scale.X, Scale.Y));
            const float HalfHeight = 50.0f * static_cast<float>(Scale.Z);
            Pawn->ConfigureShape(Radius, HalfHeight);
            Pawn->ConfigureMovement(
                static_cast<float>(ReadNumber(CharacterSpec, TEXT("speed_cm"), 500.0)),
                static_cast<float>(ReadNumber(CharacterSpec, TEXT("jump_height_cm"), 150.0)),
                static_cast<float>(ReadNumber(CharacterSpec, TEXT("gravity_scale"), 2.0)),
                ReadBool(CharacterSpec, TEXT("camera_relative"), false));

            const TSharedPtr<FJsonObject> Keys = ReadObject(CharacterSpec, TEXT("keys"));
            Pawn->ConfigureKeys(
                FKey(FName(*ReadString(Keys, TEXT("forward"), TEXT("W")))),
                FKey(FName(*ReadString(Keys, TEXT("backward"), TEXT("S")))),
                FKey(FName(*ReadString(Keys, TEXT("left"), TEXT("A")))),
                FKey(FName(*ReadString(Keys, TEXT("right"), TEXT("D")))),
                FKey(FName(*ReadString(Keys, TEXT("jump"), TEXT("SpaceBar")))));

            UStaticMesh* VisualMesh = MeshForType(Type);
            if (VisualMesh)
            {
                UStaticMeshComponent* Visual = NewObject<UStaticMeshComponent>(Pawn, TEXT("PluffVisual"));
                Visual->SetStaticMesh(VisualMesh);
                Visual->SetCollisionEnabled(ECollisionEnabled::NoCollision);
                Visual->SetupAttachment(Pawn->GetRootComponent());
                Visual->SetRelativeScale3D(Scale);
                Visual->RegisterComponent();
                ApplyColor(Visual, Color);
            }
            Player = Pawn;
        }
        Actor = Pawn;
    }
    else if (Type == TEXT("camera"))
    {
        ACameraActor* Camera = World->SpawnActor<ACameraActor>(ACameraActor::StaticClass(), SpawnTransform, SpawnParams);
        if (Camera)
        {
            UCameraComponent* CameraComponent = Camera->GetCameraComponent();
            if (CameraComponent)
            {
                if (ReadString(Node, TEXT("projection"), TEXT("perspective")) == TEXT("orthographic"))
                {
                    CameraComponent->SetProjectionMode(ECameraProjectionMode::Orthographic);
                    CameraComponent->SetOrthoWidth(static_cast<float>(ReadNumber(Node, TEXT("ortho_width"), 1000.0)));
                }
                else
                {
                    CameraComponent->SetFieldOfView(static_cast<float>(ReadNumber(Node, TEXT("field_of_view"), 60.0)));
                }
            }
            if (ReadBool(Node, TEXT("main"), false))
            {
                MainCamera = Camera;
            }
        }
        Actor = Camera;
    }
    else if (Type == TEXT("light"))
    {
        const FString LightType = ReadString(Node, TEXT("light_type"), TEXT("directional"));
        ALight* LightActor = nullptr;
        if (LightType == TEXT("point"))
        {
            LightActor = World->SpawnActor<APointLight>(APointLight::StaticClass(), SpawnTransform, SpawnParams);
        }
        else if (LightType == TEXT("spot"))
        {
            LightActor = World->SpawnActor<ASpotLight>(ASpotLight::StaticClass(), SpawnTransform, SpawnParams);
        }
        else
        {
            LightActor = World->SpawnActor<ADirectionalLight>(ADirectionalLight::StaticClass(), SpawnTransform, SpawnParams);
        }

        if (LightActor && LightActor->GetLightComponent())
        {
            ULightComponent* LightComponent = LightActor->GetLightComponent();
            LightComponent->SetMobility(EComponentMobility::Movable);
            // "intensity" is a multiplier on the engine's default for this light type.
            LightComponent->SetIntensity(LightComponent->Intensity * static_cast<float>(ReadNumber(Node, TEXT("intensity"), 1.0)));
            LightComponent->SetCastShadows(ReadBool(Node, TEXT("shadows"), true));
            if (!Color.IsEmpty())
            {
                LightComponent->SetLightColor(ColorFromHex(Color), true);
            }
            if (UPointLightComponent* PointComponent = Cast<UPointLightComponent>(LightComponent))
            {
                PointComponent->SetAttenuationRadius(static_cast<float>(ReadNumber(Node, TEXT("range_cm"), 1000.0)));
            }
            if (USpotLightComponent* SpotComponent = Cast<USpotLightComponent>(LightComponent))
            {
                SpotComponent->SetOuterConeAngle(static_cast<float>(ReadNumber(Node, TEXT("spot_angle"), 15.0)));
            }
        }
        Actor = LightActor;
    }
    else if (UStaticMesh* Mesh = MeshForType(Type))
    {
        AStaticMeshActor* MeshActor = World->SpawnActor<AStaticMeshActor>(AStaticMeshActor::StaticClass(), SpawnTransform, SpawnParams);
        if (MeshActor)
        {
            MeshComponent = MeshActor->GetStaticMeshComponent();
            MeshComponent->SetMobility(EComponentMobility::Movable);
            MeshComponent->SetStaticMesh(Mesh);
            ApplyColor(MeshComponent, Color);
        }
        Actor = MeshActor;
    }
    else
    {
        Actor = World->SpawnActor<AActor>(AActor::StaticClass(), SpawnTransform, SpawnParams);
        if (Actor)
        {
            USceneComponent* Root = NewObject<USceneComponent>(Actor, TEXT("PluffRoot"));
            Actor->SetRootComponent(Root);
            Root->RegisterComponent();
            Actor->SetActorTransform(SpawnTransform);
        }
    }

    if (!Actor)
    {
        UE_LOG(LogPluff, Warning, TEXT("Could not spawn node \\"%s\\" (%s)."), *Name, *Type);
        return nullptr;
    }

    Actor->Tags.Add(FName(*Name));
    SpawnedByName.Add(Name, Actor);

    if (Parent)
    {
        Actor->AttachToActor(Parent, FAttachmentTransformRules::KeepRelativeTransform);
        Actor->SetActorRelativeLocation(Location);
        Actor->SetActorRelativeRotation(Rotation);
        Actor->SetActorRelativeScale3D(Scale);
    }
    else if (!CharacterSpec.IsValid())
    {
        Actor->SetActorScale3D(Scale);
    }

    // "emission" is approximated with a small point light of that color on the node.
    const FString Emission = ReadString(Node, TEXT("emission"), FString());
    if (!Emission.IsEmpty() && Actor->GetRootComponent())
    {
        UPointLightComponent* Glow = NewObject<UPointLightComponent>(Actor, TEXT("PluffEmission"));
        Glow->SetMobility(EComponentMobility::Movable);
        Glow->SetupAttachment(Actor->GetRootComponent());
        Glow->SetLightColor(ColorFromHex(Emission), true);
        Glow->SetAttenuationRadius(300.0f);
        Glow->SetCastShadows(false);
        Glow->RegisterComponent();
    }

    if (PhysicsSpec.IsValid() && MeshComponent)
    {
        MeshComponent->SetCollisionProfileName(TEXT("PhysicsActor"));
        MeshComponent->SetEnableGravity(ReadBool(PhysicsSpec, TEXT("use_gravity"), true));
        MeshComponent->SetMassOverrideInKg(NAME_None, static_cast<float>(ReadNumber(PhysicsSpec, TEXT("mass"), 1.0)), true);
        MeshComponent->SetSimulatePhysics(true);
    }

    if (RotateSpec.IsValid())
    {
        UPluffRotateComponent* Spin = NewObject<UPluffRotateComponent>(Actor, TEXT("PluffRotate"));
        ReadVector(RotateSpec, TEXT("axis"), Spin->Axis);
        Spin->DegreesPerSecond = static_cast<float>(ReadNumber(RotateSpec, TEXT("degrees_per_second"), 45.0));
        Spin->RegisterComponent();
    }

    if (FollowSpec.IsValid())
    {
        UPluffCameraFollowComponent* Follow = NewObject<UPluffCameraFollowComponent>(Actor, TEXT("PluffCameraFollow"));
        ReadVector(FollowSpec, TEXT("offset_cm"), Follow->Offset);
        Follow->SmoothSpeed = static_cast<float>(ReadNumber(FollowSpec, TEXT("smooth_speed"), 8.0));
        Follow->RegisterComponent();

        FPluffPendingFollow Pending;
        Pending.Component = Follow;
        Pending.TargetName = ReadString(FollowSpec, TEXT("target"), FString());
        PendingFollows.Add(Pending);
    }

    const TArray<TSharedPtr<FJsonValue>>* Children = nullptr;
    if (Node->TryGetArrayField(TEXT("children"), Children) && Children)
    {
        for (const TSharedPtr<FJsonValue>& Value : *Children)
        {
            const TSharedPtr<FJsonObject> Child = AsObject(Value);
            if (Child.IsValid())
            {
                SpawnNode(Child, Actor);
            }
        }
    }

    return Actor;
}

void APluffGameMode::ResolveFollowTargets()
{
    for (const FPluffPendingFollow& Pending : PendingFollows)
    {
        const TWeakObjectPtr<AActor>* Found = SpawnedByName.Find(Pending.TargetName);
        if (Pending.Component.IsValid() && Found && Found->IsValid())
        {
            Pending.Component->Target = *Found;
        }
        else
        {
            UE_LOG(LogPluff, Warning, TEXT("camera_follow target \\"%s\\" was not found."), *Pending.TargetName);
        }
    }
    PendingFollows.Empty();
}
`
}
