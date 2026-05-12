<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\GeneroJugador;
use App\Models\Equipo;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreJugadorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $equipo = $this->route('equipo');
        if ($equipo instanceof Equipo) {
            $this->merge([
                'id_equipo' => $equipo->id_equipo,
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:255'],
            'fecha_nacimiento' => ['required', 'date', 'before:today'],
            'genero' => ['required', new Enum(GeneroJugador::class)],
            'id_equipo' => [
                'required',
                'integer',
                Rule::exists('equipos', 'id_equipo')->where('estado', 1),
            ],
        ];
    }

    public function attributes(): array
    {
        return [
            'nombre' => 'nombre del jugador',
            'fecha_nacimiento' => 'fecha de nacimiento',
            'genero' => 'género',
            'id_equipo' => 'equipo',
        ];
    }

    public function messages(): array
    {
        return [
            'fecha_nacimiento.before' => 'La fecha de nacimiento debe ser anterior a hoy.',
        ];
    }
}
