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
        Schema::table('quotations', function (Blueprint $table) {
            $table->longText('signature_data')->nullable(); // Base64 of the signature
            $table->timestamp('signed_at')->nullable();
            $table->string('signer_name')->nullable();
            $table->string('signer_ip')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quotations', function (Blueprint $table) {
            $table->dropColumn(['signature_data', 'signed_at', 'signer_name', 'signer_ip']);
        });
    }
};
