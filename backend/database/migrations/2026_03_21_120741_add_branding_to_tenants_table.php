<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('type')->default('company'); // company or individual
            $table->string('brand_name')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('primary_color')->default('#4B0082');
            $table->string('secondary_color')->default('#FF8C00');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['type', 'brand_name', 'logo_url', 'primary_color', 'secondary_color']);
        });
    }
};
