<?php

use App\Models\User;
use App\Models\Tenant;

it('can register a new user and create a tenant', function () {
    $this->withoutExceptionHandling();
    $response = $this->postJson('/api/auth/register', [
        'full_name' => 'Test User',
        'email' => 'test@desksuite.localhost',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'workspace_name' => 'Test Company',
        'subdomain' => 'test-company',
        'type' => 'company',
    ]);

    $response->assertStatus(201)
             ->assertJsonStructure([
                 'token',
                 'user' => [
                     'id',
                     'email',
                     'current_tenant_id',
                 ],
                 'tenant' => [
                     'id',
                     'name',
                 ],
             ]);

    $this->assertDatabaseHas('users', [
        'email' => 'test@desksuite.localhost',
    ]);

    $this->assertDatabaseHas('tenants', [
        'name' => 'Test Company',
    ]);
});

it('can login an existing user', function () {
    $this->withoutExceptionHandling();
    $tenant = Tenant::create([
        'name' => 'Acme Corp',
        'brand_name' => 'Acme Corp',
        'subdomain' => 'acme-corp',
        'type' => 'company',
    ]);

    $user = User::create([
        'full_name' => 'Login Test User',
        'email' => 'login@desksuite.localhost',
        'password' => bcrypt('password123'),
        'current_tenant_id' => $tenant->id,
    ]);

    $user->tenants()->attach($tenant->id, ['role' => 'owner']);

    $response = $this->postJson('/api/auth/login', [
        'email' => 'login@desksuite.localhost',
        'password' => 'password123',
    ]);

    $response->assertStatus(200)
             ->assertJsonStructure([
                 'token',
                 'user' => [
                     'id',
                     'email',
                     'current_tenant',
                 ],
             ]);
});
