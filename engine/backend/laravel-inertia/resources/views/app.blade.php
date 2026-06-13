{{-- ============================================================ --}}
{{-- ARKZEN GENERATED BLADE — [Laravel Inertia]                   --}}
{{-- Auto-generated from @arkzen:meta:web — do not edit directly. --}}
{{-- ============================================================ --}}
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'visual-lab') }}</title>

    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔬</text></svg>" />
    <meta name="description" content="Visual Lab — tests every new frontend package installed across all 5 stacks (Three.js/R3F, BabylonJS, PlayCanvas, PixiJS, OGL, Phaser, Matter.js, Rapier, p5.js, Konva, Fabric.js, REGL, TWGL, Lottie, tsParticles, Proton, Typed.js, Rough Notation, Splitting.js, Vanilla Tilt, Lenis, Canvas Confetti, CurtainsJS, Maath, TroikaText). Also demos both @arkzen:script DSL blocks (global + named) and the experimental HTML-in-Canvas API (Chrome 148+). The definitive Arkzen visual/graphics/canvas reference." />
    <meta property="og:title" content="visual-lab" />
    <meta property="og:description" content="Visual Lab — tests every new frontend package installed across all 5 stacks (Three.js/R3F, BabylonJS, PlayCanvas, PixiJS, OGL, Phaser, Matter.js, Rapier, p5.js, Konva, Fabric.js, REGL, TWGL, Lottie, tsParticles, Proton, Typed.js, Rough Notation, Splitting.js, Vanilla Tilt, Lenis, Canvas Confetti, CurtainsJS, Maath, TroikaText). Also demos both @arkzen:script DSL blocks (global + named) and the experimental HTML-in-Canvas API (Chrome 148+). The definitive Arkzen visual/graphics/canvas reference." />
    <meta property="og:type" content="website" />

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" rel="stylesheet" />

        <!-- Scripts + Styles via Laravel Vite plugin -->
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])

        <!-- Inertia head (title, meta tags from InertiaHead component) -->
        @inertiaHead
    </head>
    <body>
        @inertia
    </body>
</html>
