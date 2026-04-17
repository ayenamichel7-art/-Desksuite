<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Dossiers (Drive) ──────────────────────────────────
        Schema::create('folders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('parent_id')->nullable();
            $table->string('name');
            $table->uuid('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            // Moved parent_id foreign key outside for PostgreSQL safety
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('folders', function (Blueprint $table) {
            $table->foreign('parent_id')->references('id')->on('folders')->cascadeOnDelete();
        });

        // ── Fichiers (Drive) ──────────────────────────────────
        Schema::create('files', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('folder_id')->nullable();
            $table->string('name');
            $table->string('mime_type', 100)->nullable();
            $table->bigInteger('size_bytes')->nullable();
            $table->text('s3_path');
            $table->integer('version_count')->default(1);
            $table->boolean('is_trashed')->default(false);
            $table->uuid('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('folder_id')->references('id')->on('folders')->cascadeOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('files');
        Schema::dropIfExists('folders');
    }
};
