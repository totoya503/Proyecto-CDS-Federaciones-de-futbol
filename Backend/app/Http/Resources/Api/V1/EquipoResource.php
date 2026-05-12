<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EquipoResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_equipo' => $this->id_equipo,
            'nombre' => $this->nombre,
            'id_federacion' => $this->id_federacion,
            'estado' => $this->estado,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'federacion' => new FederacionSummaryResource($this->whenLoaded('federacion')),
            'jugadores' => JugadorResource::collection($this->whenLoaded('jugadores')),
            'jugadores_count' => $this->whenCounted('jugadores'),
        ];
    }
}
