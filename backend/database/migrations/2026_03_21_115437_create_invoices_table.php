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
        Schema::create('invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('contact_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('quotation_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reference')->unique();
            $table->decimal('total_amount', 12, 2);
            $table->string('status')->default('unpaid'); // unpaid, paid, cancelled
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
