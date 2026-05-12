<?php

use App\Http\Controllers\Api\V1\EquipoController;
use App\Http\Controllers\Api\V1\FederacionController;
use App\Http\Controllers\Api\V1\JugadorController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('federaciones/{federacion}/equipos', [FederacionController::class, 'equipos']);
    Route::post('federaciones/{federacion}/equipos', [FederacionController::class, 'storeEquipo']);

    Route::get('equipos/{equipo}/jugadores', [EquipoController::class, 'jugadores']);
    Route::post('equipos/{equipo}/jugadores', [EquipoController::class, 'storeJugador']);

    Route::apiResource('federaciones', FederacionController::class)
        ->parameters(['federaciones' => 'federacion']);
    Route::apiResource('equipos', EquipoController::class)
        ->parameters(['equipos' => 'equipo']);
    Route::apiResource('jugadores', JugadorController::class)
        ->parameters(['jugadores' => 'jugador']);
});
