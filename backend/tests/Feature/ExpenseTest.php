<?php

use App\Models\User;
use App\Models\Tenant;
use App\Models\Expense;

beforeEach(function () {
    $this->tenant = Tenant::create([
        'name' => 'Test Company',
        'subdomain' => 'test-company',
        'brand_name' => 'Test Company',
        'type' => 'company',
    ]);

    $this->user = User::create([
        'full_name' => 'Expense Tester',
        'password' => bcrypt('password'),
        'email' => 'tester@desksuite.localhost',
        'current_tenant_id' => $this->tenant->id,
    ]);

    $this->user->tenants()->attach($this->tenant->id, ['role' => 'owner']);
});

it('can list expenses with pagination', function () {
    Expense::create([
        'description' => 'Office Supplies',
        'amount' => 50.00,
        'currency' => 'EUR',
        'category' => 'office',
        'date' => now()->format('Y-m-d'),
        'tenant_id' => $this->tenant->id,
    ]);

    $response = $this->actingAs($this->user)->getJson('/api/expenses');

    $response->assertStatus(200)
             ->assertJsonStructure([
                 'current_page',
                 'data',
             ])
             ->assertJsonCount(1, 'data')
             ->assertJsonPath('data.0.description', 'Office Supplies');
});

it('can create a new manual expense', function () {
    $response = $this->actingAs($this->user)->postJson('/api/expenses', [
        'description' => 'Coffee for Team',
        'amount' => 15.50,
        'currency' => 'EUR',
        'category' => 'meals',
        'date' => '2025-03-22',
    ]);

    $response->assertStatus(201)
             ->assertJsonPath('description', 'Coffee for Team');

    $this->assertDatabaseHas('expenses', [
        'description' => 'Coffee for Team',
        'tenant_id' => $this->tenant->id,
    ]);
});

it('cannot see expenses from another tenant', function () {
    $otherTenant = Tenant::create([
        'name' => 'Other Company',
        'subdomain' => 'other-company',
        'brand_name' => 'Other Company',
        'type' => 'company',
    ]);
    
    Expense::create([
        'description' => 'Secret Expense',
        'amount' => 1000.00,
        'currency' => 'USD',
        'date' => '2025-01-01',
        'tenant_id' => $otherTenant->id,
    ]);

    $response = $this->actingAs($this->user)->getJson('/api/expenses');

    $response->assertStatus(200)
             ->assertJsonCount(0, 'data');
});
