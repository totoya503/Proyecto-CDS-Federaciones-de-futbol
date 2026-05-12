<?php

namespace Database\Seeders;

use App\Enums\GeneroJugador;
use App\Models\Equipo;
use App\Models\Federacion;
use App\Models\Jugador;
use Illuminate\Database\Seeder;

/**
 * Datos de demostración: varias federaciones, equipos y jugadores con relaciones válidas.
 */
class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $fedSv = Federacion::create([
            'nombre' => 'Federación Salvadoreña de Fútbol',
            'fecha_fundacion' => '1935-05-23',
            'departamento' => 'San Salvador',
            'municipio' => 'San Salvador',
            'direccion' => 'Estadio Cuscatlán, Blvd. Los Próceres, sector ciudadela Don Bosco',
            'estado' => 1,
        ]);

        $fedGt = Federacion::create([
            'nombre' => 'Federación Nacional de Fútbol de Guatemala',
            'fecha_fundacion' => '1902-05-06',
            'departamento' => 'Guatemala',
            'municipio' => 'Ciudad de Guatemala',
            'direccion' => 'Zona 15, Complejo Deportivo Federación, diagonal 6',
            'estado' => 1,
        ]);

        $fedDemoInactiva = Federacion::create([
            'nombre' => 'Liga Regional Demo (inactiva)',
            'fecha_fundacion' => '2010-01-01',
            'departamento' => 'Sonsonate',
            'municipio' => 'Sonsonate',
            'direccion' => 'Campo municipal — ejemplo de federación desactivada para pruebas',
            'estado' => 0,
        ]);

        // --- Equipos Federación SV ---
        $alianza = Equipo::create([
            'nombre' => 'Alianza FC',
            'id_federacion' => $fedSv->id_federacion,
            'estado' => 1,
        ]);

        $fas = Equipo::create([
            'nombre' => 'CD FAS',
            'id_federacion' => $fedSv->id_federacion,
            'estado' => 1,
        ]);

        // --- Equipos Federación GT ---
        $municipal = Equipo::create([
            'nombre' => 'CSD Municipal',
            'id_federacion' => $fedGt->id_federacion,
            'estado' => 1,
        ]);

        Equipo::create([
            'nombre' => 'Equipo histórico archivado',
            'id_federacion' => $fedSv->id_federacion,
            'estado' => 0,
        ]);

        // --- Jugadores Alianza ---
        $this->jugador($alianza, 'Rodrigo Andrés Herrera', '2003-04-18', GeneroJugador::Masculino);
        $this->jugador($alianza, 'Daniel Esteban Rivas', '2004-11-02', GeneroJugador::Masculino);
        $this->jugador($alianza, 'María Fernanda López', '2005-07-09', GeneroJugador::Femenino);

        // --- Jugadores FAS ---
        $this->jugador($fas, 'Kevin Josué Méndez', '2002-01-30', GeneroJugador::Masculino);
        $this->jugador($fas, 'Sofía Alejandra Cruz', '2006-03-14', GeneroJugador::Femenino);

        // --- Jugadores Municipal ---
        $this->jugador($municipal, 'Carlos Alberto Pineda', '2001-09-21', GeneroJugador::Masculino);
        $this->jugador($municipal, 'Alex Rivera', '2004-12-05', GeneroJugador::Otro);

        // Jugador inactivo (ejemplo de baja lógica)
        Jugador::create([
            'nombre' => 'Exjugador de prueba',
            'fecha_nacimiento' => '1999-06-01',
            'genero' => GeneroJugador::Masculino,
            'id_equipo' => $fas->id_equipo,
            'estado' => 0,
        ]);
    }

    private function jugador(Equipo $equipo, string $nombre, string $fecha, GeneroJugador $genero): void
    {
        Jugador::create([
            'nombre' => $nombre,
            'fecha_nacimiento' => $fecha,
            'genero' => $genero,
            'id_equipo' => $equipo->id_equipo,
            'estado' => 1,
        ]);
    }
}
