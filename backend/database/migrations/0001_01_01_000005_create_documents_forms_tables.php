<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Documents (Docs / Sheets / Slides) ──────────────────
        Schema::create('documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('type', 20); // doc, sheet, slide
            $table->string('name');
            $table->jsonb('content')->nullable();
            $table->uuid('last_modified_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('last_modified_by')->references('id')->on('users')->nullOnDelete();
        });

        // ── Formulaires ─────────────────────────────────────────
        Schema::create('forms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('title');
            $table->jsonb('schema');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });

        Schema::create('form_responses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('form_id');
            $table->uuid('tenant_id');
            $table->jsonb('data');
            $table->timestamps();

            $table->foreign('form_id')->references('id')->on('forms')->cascadeOnDelete();
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('form_responses');
        Schema::dropIfExists('forms');
        Schema::dropIfExists('documents');
    }
};
