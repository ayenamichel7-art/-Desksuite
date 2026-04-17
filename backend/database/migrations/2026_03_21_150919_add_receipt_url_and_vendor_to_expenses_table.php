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
        Schema::table('expenses', function (Blueprint $table) {
            $table->string('vendor')->nullable()->after('category');
            $table->string('receipt_url')->nullable()->after('date');
            $table->string('status')->default('uploaded')->after('receipt_url'); // uploaded, processing, completed, error
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn(['vendor', 'receipt_url', 'status']);
        });
    }
};
