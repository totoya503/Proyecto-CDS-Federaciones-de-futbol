<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreFederacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:255'],
            'fecha_fundacion' => ['required', 'date', 'before_or_equal:today'],
            'departamento' => ['required', 'string', 'max:120'],
            'municipio' => ['required', 'string', 'max:120'],
            'direccion' => ['required', 'string', 'max:500'],
        ];
    }

    public function attributes(): array
    {
        return [
            'nombre' => 'nombre de la federación',
            'fecha_fundacion' => 'fecha de fundación',
            'departamento' => 'departamento',
            'municipio' => 'municipio',
            'direccion' => 'dirección (complemento)',
        ];
    }

    public function messages(): array
    {
        return [
            'fecha_fundacion.before_or_equal' => 'La fecha de fundación no puede ser futura.',
        ];
    }
}
