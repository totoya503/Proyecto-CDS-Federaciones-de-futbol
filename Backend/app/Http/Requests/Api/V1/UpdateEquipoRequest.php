<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEquipoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['sometimes', 'required', 'string', 'max:255'],
            'id_federacion' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('federaciones', 'id_federacion')->where('estado', 1),
            ],
            'estado' => ['sometimes', 'integer', Rule::in([0, 1])],
        ];
    }

    public function attributes(): array
    {
        return (new StoreEquipoRequest)->attributes() + [
            'estado' => 'estado',
        ];
    }

    public function messages(): array
    {
        return [
            'estado.in' => 'El estado debe ser 1 (activo) o 0 (inactivo).',
        ];
    }
}
