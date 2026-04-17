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
            $table->decimal('amount_net', 12, 2)->after('amount');
            $table->decimal('amount_vat', 12, 2)->after('amount_net');
            $table->decimal('vat_rate', 5, 2)->default(20.00)->after('amount_vat'); // Taux par défaut flexible
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            //
        });
    }
};
