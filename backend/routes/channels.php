<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (string) $user->id === (string) $id;
});

Broadcast::channel('chat.{tenantId}.{channel}', function ($user, $tenantId) {
    return $user->tenants()->where('tenants.id', $tenantId)->exists();
});
