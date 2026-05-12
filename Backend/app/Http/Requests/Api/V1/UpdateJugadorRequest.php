<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\GeneroJugador;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdateJugadorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['sometimes', 'required', 'string', 'max:255'],
            'fecha_nacimiento' => ['sometimes', 'required', 'date', 'before:today'],
            'genero' => ['sometimes', 'required', new Enum(GeneroJugador::class)],
            'id_equipo' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('equipos', 'id_equipo')->where('estado', 1),
            ],
            'estado' => ['sometimes', 'integer', Rule::in([0, 1])],
        ];
    }

    public function attributes(): array
    {
        return (new StoreJugadorRequest)->attributes() + [
            'estado' => 'estado',
        ];
    }

    public function messages(): array
    {
        return [
            'fecha_nacimiento.before' => 'La fecha de nacimiento debe ser anterior a hoy.',
            'estado.in' => 'El estado debe ser 1 (activo) o 0 (inactivo).',
        ];
    }
}
