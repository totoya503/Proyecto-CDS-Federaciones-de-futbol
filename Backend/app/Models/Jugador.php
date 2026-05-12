<?php

namespace App\Models;

use App\Enums\GeneroJugador;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Jugador extends Model
{
    protected $table = 'jugadores';

    protected $primaryKey = 'id_jugador';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'nombre',
        'fecha_nacimiento',
        'genero',
        'id_equipo',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'fecha_nacimiento' => 'date',
            'id_equipo' => 'integer',
            'estado' => 'integer',
            'genero' => GeneroJugador::class,
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'id_jugador';
    }

    public function equipo(): BelongsTo
    {
        return $this->belongsTo(Equipo::class, 'id_equipo', 'id_equipo');
    }

    public function scopeActivos($query)
    {
        return $query->where('jugadores.estado', 1);
    }
}
