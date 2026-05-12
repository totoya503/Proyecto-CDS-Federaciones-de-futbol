<?php

namespace App\Http\Requests\Api\V1;

use App\Models\Federacion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEquipoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $federacion = $this->route('federacion');
        if ($federacion instanceof Federacion) {
            $this->merge([
                'id_federacion' => $federacion->id_federacion,
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:255'],
            'id_federacion' => [
                'required',
                'integer',
                Rule::exists('federaciones', 'id_federacion')->where('estado', 1),
            ],
        ];
    }

    public function attributes(): array
    {
        return [
            'nombre' => 'nombre del equipo',
            'id_federacion' => 'federación',
        ];
    }
}
