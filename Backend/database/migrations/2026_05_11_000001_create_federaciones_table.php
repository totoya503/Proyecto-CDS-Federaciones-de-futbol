<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('federaciones', function (Blueprint $table) {
            $table->id('id_federacion');
            $table->string('nombre', 255);
            $table->date('fecha_fundacion');
            $table->string('departamento', 120);
            $table->string('municipio', 120);
            $table->string('direccion', 500)->comment('Complemento de dirección (calle, referencia, etc.)');
            $table->unsignedTinyInteger('estado')->default(1)->comment('1 activo, 0 inactivo');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('federaciones');
    }
};
