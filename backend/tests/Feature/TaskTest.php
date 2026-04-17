<?php

use App\Models\User;
use App\Models\Tenant;
use App\Models\Task;

beforeEach(function () {
    $this->tenant = Tenant::create([
        'name' => 'Test Company',
        'subdomain' => 'test-company',
    ]);

    $this->user = User::create([
        'full_name' => 'Task Tester',
        'password' => bcrypt('password'),
        'email' => 'tester@desksuite.localhost',
        'current_tenant_id' => $this->tenant->id,
    ]);

    $this->user->tenants()->attach($this->tenant->id, ['role' => 'owner']);
});

it('can list tasks with pagination and stats', function () {
    // Generate tasks for the tenant
    Task::create([
        'tenant_id' => $this->tenant->id,
        'assigned_to' => $this->user->id,
        'title' => 'Pending Task 1',
        'status' => 'todo',
        'priority' => 'low',
    ]);
    Task::create([
        'tenant_id' => $this->tenant->id,
        'assigned_to' => $this->user->id,
        'title' => 'Done Task',
        'status' => 'done',
        'priority' => 'high',
    ]);

    $response = $this->actingAs($this->user)->getJson('/api/tasks');

    $response->assertStatus(200)
             ->assertJsonStructure([
                 'tasks' => [
                     'current_page',
                     'data',
                 ],
                 'stats' => [
                     'total',
                     'done',
                     'pending',
                 ],
             ])
             ->assertJsonPath('stats.total', 2)
             ->assertJsonPath('stats.done', 1)
             ->assertJsonPath('stats.pending', 1);
});

it('can create a new task', function () {
    $response = $this->actingAs($this->user)->postJson('/api/tasks', [
        'title' => 'New Task',
        'priority' => 'high',
        'status' => 'todo',
    ]);

    $response->assertStatus(201)
             ->assertJsonPath('title', 'New Task');

    $this->assertDatabaseHas('tasks', [
        'title' => 'New Task',
        'tenant_id' => $this->tenant->id,
    ]);
});

it('cannot see tasks from another tenant', function () {
    $otherTenant = Tenant::create([
        'name' => 'Other Company',
        'subdomain' => 'other-company',
    ]);
    
    Task::create([
        'tenant_id' => $otherTenant->id,
        'assigned_to' => $this->user->id,
        'title' => 'Other Task',
        'status' => 'todo',
        'priority' => 'low',
    ]);

    $response = $this->actingAs($this->user)->getJson('/api/tasks');

    // Stats total should be 0 because it isolates by current_tenant_id through the BelongsToTenant trait
    $response->assertStatus(200)
             ->assertJsonPath('stats.total', 0);
});
