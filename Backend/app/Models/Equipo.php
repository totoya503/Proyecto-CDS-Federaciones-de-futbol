<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Equipo extends Model
{
    protected $table = 'equipos';

    protected $primaryKey = 'id_equipo';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'nombre',
        'id_federacion',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'id_federacion' => 'integer',
            'estado' => 'integer',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'id_equipo';
    }

    public function federacion(): BelongsTo
    {
        return $this->belongsTo(Federacion::class, 'id_federacion', 'id_federacion');
    }

    public function jugadores(): HasMany
    {
        return $this->hasMany(Jugador::class, 'id_equipo', 'id_equipo');
    }

    public function scopeActivos($query)
    {
        return $query->where('equipos.estado', 1);
    }
}
