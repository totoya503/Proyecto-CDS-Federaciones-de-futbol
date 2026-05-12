<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FederacionFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_federation_team_player_flow(): void
    {
        $fed = $this->postJson('/api/v1/federaciones', [
            'nombre' => 'Federación de Prueba',
            'fecha_fundacion' => '2020-01-15',
            'departamento' => 'San Salvador',
            'municipio' => 'San Salvador',
            'direccion' => 'Colonia Escalón, calle principal #123',
        ]);

        $fed->assertCreated();
        $fed->assertJsonPath('data.nombre', 'Federación de Prueba');
        $idFed = $fed->json('data.id_federacion');

        $equipo = $this->postJson("/api/v1/federaciones/{$idFed}/equipos", [
            'nombre' => 'Selección A',
        ]);
        $equipo->assertCreated();
        $idEquipo = $equipo->json('data.id_equipo');

        $jugador = $this->postJson("/api/v1/equipos/{$idEquipo}/jugadores", [
            'nombre' => 'Ana Gómez',
            'fecha_nacimiento' => '2005-03-20',
            'genero' => 'F',
        ]);
        $jugador->assertCreated();
        $jugador->assertJsonPath('data.genero_etiqueta', 'Femenino');

        $this->getJson("/api/v1/federaciones/{$idFed}?with_equipos=1")
            ->assertOk()
            ->assertJsonPath('data.equipos.0.nombre', 'Selección A');
    }
}
