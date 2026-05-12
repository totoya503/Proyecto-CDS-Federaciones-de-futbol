<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FederacionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_federacion' => $this->id_federacion,
            'nombre' => $this->nombre,
            'fecha_fundacion' => $this->fecha_fundacion?->format('Y-m-d'),
            'departamento' => $this->departamento,
            'municipio' => $this->municipio,
            'direccion' => $this->direccion,
            'estado' => $this->estado,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'equipos' => EquipoSummaryResource::collection($this->whenLoaded('equipos')),
            'equipos_count' => $this->whenCounted('equipos'),
        ];
    }
}
