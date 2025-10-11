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
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('teacher_id');
            $table->string('student_name');
            $table->string('class_type');
            $table->date('schedule');
            $table->string('time');
            $table->string('status');
            $table->integer('completed')->default(0);
            $table->integer('cancelled')->default(0);
            $table->integer('class_left')->default(0);
            $table->integer('free_classes')->default(0);
            $table->integer('free_class_consumed')->default(0);
            $table->integer('absent_w_ntc_counted')->default(0); // Add missing field
            $table->integer('purchased_class')->default(0); // Add purchased class column
            $table->integer('absent_w_ntc_not_counted')->default(0); // Add new field for "Absent w/ntc-not counted"
            $table->integer('absent_without_notice')->default(0); // Add new field for "Absent Without Notice"
            $table->text('notes')->nullable(); // Add notes column
            $table->timestamps();
            
            $table->foreign('teacher_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classes');
    }
};
