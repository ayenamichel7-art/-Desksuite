<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // $this->call([
        //     TenantSeeder::class,
        //     UserSeeder::class,
        // ]);

        // Let's create a default tenant and user for login
        $tenant = Tenant::create([
            'name' => 'Default Tenant',
            'subdomain' => 'app',
            'config' => [],
        ]);

        $user = User::create([
            'current_tenant_id' => $tenant->id,
            'full_name' => 'Admin User',
            'email' => 'admin@desksuite.com',
            'password' => Hash::make('password'),
        ]);

        $user->tenants()->attach($tenant->id, ['role' => 'admin']);
    }
}
