<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Federacion extends Model
{
    protected $table = 'federaciones';

    protected $primaryKey = 'id_federacion';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'nombre',
        'fecha_fundacion',
        'departamento',
        'municipio',
        'direccion',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'fecha_fundacion' => 'date',
            'estado' => 'integer',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'id_federacion';
    }

    public function equipos(): HasMany
    {
        return $this->hasMany(Equipo::class, 'id_federacion', 'id_federacion');
    }

    public function scopeActivas($query)
    {
        return $query->where('federaciones.estado', 1);
    }
}
