<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jugadores', function (Blueprint $table) {
            $table->id('id_jugador');
            $table->string('nombre', 255);
            $table->date('fecha_nacimiento');
            $table->string('genero', 1)->comment('M masculino, F femenino, O otro, X prefiero no decir');
            $table->foreignId('id_equipo')
                ->constrained('equipos', 'id_equipo')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->unsignedTinyInteger('estado')->default(1)->comment('1 activo, 0 inactivo');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jugadores');
    }
};
