<?php

namespace App\Http\Resources\Api\V1;

use App\Enums\GeneroJugador;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JugadorResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $genero = $this->genero instanceof GeneroJugador
            ? $this->genero
            : GeneroJugador::tryFrom((string) $this->genero);

        return [
            'id_jugador' => $this->id_jugador,
            'nombre' => $this->nombre,
            'fecha_nacimiento' => $this->fecha_nacimiento?->format('Y-m-d'),
            'genero' => $genero?->value ?? (string) $this->genero,
            'genero_etiqueta' => $genero?->etiqueta(),
            'id_equipo' => $this->id_equipo,
            'estado' => $this->estado,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'equipo' => new EquipoSummaryResource($this->whenLoaded('equipo')),
        ];
    }
}
