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
    Schema::create('kho_tongs', function (Blueprint $table) {
      $table->id();
      $table->string('ma_lo_san_pham')->unique();
      $table->foreignId('san_pham_id')->constrained('san_phams');
      $table->integer('so_luong_ton');


      $table->string('nguoi_tao');
      $table->string('nguoi_cap_nhat');
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('kho_tongs');
  }
};