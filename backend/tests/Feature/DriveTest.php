<?php

use App\Models\User;
use App\Models\Tenant;
use App\Models\Folder;
use App\Models\File;

beforeEach(function () {
    $this->tenant = Tenant::create([
        'name' => 'Drive Company',
        'subdomain' => 'drive-test',
        'brand_name' => 'Drive Company',
        'type' => 'company',
    ]);

    $this->user = User::create([
        'full_name' => 'Drive Tester',
        'password' => bcrypt('password'),
        'email' => 'driver@desksuite.localhost',
        'current_tenant_id' => $this->tenant->id,
    ]);

    $this->user->tenants()->attach($this->tenant->id, ['role' => 'owner']);
});

it('can list items in the root drive', function () {
    Folder::create([
        'name' => 'My Documents',
        'tenant_id' => $this->tenant->id,
        'created_by' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)->getJson('/api/drive');

    $response->assertStatus(200)
             ->assertJsonStructure(['folders', 'files'])
             ->assertJsonCount(1, 'folders')
             ->assertJsonPath('folders.0.name', 'My Documents');
});

it('can create a folder', function () {
    $response = $this->actingAs($this->user)->postJson('/api/drive/folders', [
        'name' => 'Project Alpha',
    ]);

    $response->assertStatus(201)
             ->assertJsonPath('name', 'Project Alpha');

    $this->assertDatabaseHas('folders', [
        'name' => 'Project Alpha',
        'tenant_id' => $this->tenant->id,
    ]);
});
