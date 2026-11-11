<?php

use Illuminate\Support\Facades\Broadcast;

// ============================================================
// ARKZEN GENERATED CHANNEL AUTHORIZATIONS
// DO NOT EDIT DIRECTLY. Arkzen manages this file.
// ============================================================


// Module: body-mail-notification
Broadcast::channel('body-mail-notification.{id}', function ($user, $id = null) {
    return (int) $user->id === (int) $id;
});

// Module: broadcast-test
Broadcast::channel('broadcast-test-public', function () {
    return true;
});

// Module: broadcast-test
Broadcast::channel('broadcast-test-presence', function ($user, $id = null) {
    if (!$user) return false;
    return ['id' => $user->id, 'name' => $user->name];
});

// Module: notification-test
Broadcast::channel('notification-test.{id}', function ($user, $id = null) {
    return (int) $user->id === (int) $id;
});

// Module: notification-test
Broadcast::channel('notification-test.notifications', function () {
    return true;
});

// Module: broadcast-test
Broadcast::channel('broadcast-test.{id}', function ($user, $id = null) {
    return $user !== null;
});

// Module: kotoba
Broadcast::channel('kotoba.{id}', function ($user, $id = null) {
    return (int) $user->id === (int) $id;
});

// Module: express-test
Broadcast::channel('express-test.{id}', function ($user, $id = null) {
    return (int) $user->id === (int) $id;
});

// Module: express-test
Broadcast::channel('express-test-public', function () {
    return true;
});

// Module: express-test-2
Broadcast::channel('express-test-2.{id}', function ($user, $id = null) {
    return (int) $user->id === (int) $id;
});

// Module: express-test-2
Broadcast::channel('express-test-2-public', function () {
    return true;
});

// Module: fastapi-test
Broadcast::channel('fastapi-test.{id}', function ($user, $id = null) {
    return (int) $user->id === (int) $id;
});

// Module: fastapi-test
Broadcast::channel('fastapi-test-public', function () {
    return true;
});

// Module: queue-flow
Broadcast::channel('queue-flow.{queueId}', function () {
    return true;
});

// Module: shikaku
Broadcast::channel('shikaku.project.{id}', function ($user, $id = null) {
    if (!$user) return false;
    return ['id' => $user->id, 'name' => $user->name];
});
