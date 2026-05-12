<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EquipoSummaryResource extends JsonResource
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
        ];
    }
}
