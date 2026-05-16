<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Arkzen') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" rel="stylesheet" />

        <!-- Scripts + Styles via Laravel Vite plugin -->
        @viteReactRefresh
        @vite(['resources/js/app.tsx'])

        <!-- Inertia head (title, meta tags from InertiaHead component) -->
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>