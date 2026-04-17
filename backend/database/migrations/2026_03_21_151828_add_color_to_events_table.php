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
        Schema::table('events', function (Blueprint $table) {
            $table->string('color')->nullable()->after('location');
            $table->boolean('is_full_day')->default(false)->after('end_at');
            $table->foreignUuid('task_id')->nullable()->constrained()->nullOnDelete()->after('created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['color', 'is_full_day', 'task_id']);
        });
    }
};
