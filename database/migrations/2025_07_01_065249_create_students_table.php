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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Full Name
            $table->string('email')->unique(); // Email
            $table->integer('purchased_class_regular')->default(0); // Regular class purchased count
            $table->integer('purchased_class_premium')->default(0); // Premium class purchased count
            $table->integer('purchased_class_group')->default(0); // Group class purchased count
            $table->integer('completed')->default(0); // Completed classes
            $table->integer('cancelled')->default(0); // Cancelled classes
            $table->integer('class_left')->default(0); // Classes left for the student
            $table->integer('free_classes')->default(0); // Free classes (e.g., from cancelled ones)
            $table->integer('free_class_consumed')->default(0); // Free classes that were used
            $table->integer('absent_w_ntc_counted')->default(0); // Absent with notice counted
            $table->integer('absent_w_ntc_not_counted')->default(0); // Absent with notice not counted
            $table->integer('absent_without_notice')->default(0); // Absent without notice
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
