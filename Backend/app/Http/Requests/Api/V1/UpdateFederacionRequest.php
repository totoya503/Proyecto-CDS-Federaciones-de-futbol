<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFederacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['sometimes', 'required', 'string', 'max:255'],
            'fecha_fundacion' => ['sometimes', 'required', 'date', 'before_or_equal:today'],
            'departamento' => ['sometimes', 'required', 'string', 'max:120'],
            'municipio' => ['sometimes', 'required', 'string', 'max:120'],
            'direccion' => ['sometimes', 'required', 'string', 'max:500'],
            'estado' => ['sometimes', 'integer', Rule::in([0, 1])],
        ];
    }

    public function attributes(): array
    {
        return (new StoreFederacionRequest)->attributes() + [
            'estado' => 'estado',
        ];
    }

    public function messages(): array
    {
        return [
            'fecha_fundacion.before_or_equal' => 'La fecha de fundación no puede ser futura.',
            'estado.in' => 'El estado debe ser 1 (activo) o 0 (inactivo).',
        ];
    }
}
