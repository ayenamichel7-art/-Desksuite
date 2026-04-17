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
            $table->string('smtp_host')->nullable();
            $table->integer('smtp_port')->nullable();
            $table->string('smtp_username')->nullable();
            $table->string('smtp_password')->nullable();
            $table->string('smtp_encryption')->nullable(); // tls, ssl
            $table->string('smtp_from_address')->nullable();
            $table->string('smtp_from_name')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'smtp_encryption', 'smtp_from_address', 'smtp_from_name']);
        });
    }
};
