<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FederacionSummaryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_federacion' => $this->id_federacion,
            'nombre' => $this->nombre,
            'estado' => $this->estado,
        ];
    }
}
