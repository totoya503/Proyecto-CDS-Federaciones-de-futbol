<?php

namespace App\Enums;

enum GeneroJugador: string
{
    case Masculino = 'M';
    case Femenino = 'F';
    case Otro = 'O';
    case NoInforma = 'X';

    public function etiqueta(): string
    {
        return match ($this) {
            self::Masculino => 'Masculino',
            self::Femenino => 'Femenino',
            self::Otro => 'Otro',
            self::NoInforma => 'Prefiero no decir',
        };
    }
}
