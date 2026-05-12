<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreJugadorRequest;
use App\Http\Requests\Api\V1\UpdateJugadorRequest;
use App\Http\Resources\Api\V1\JugadorResource;
use App\Models\Jugador;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class JugadorController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);

        $query = Jugador::query()
            ->with('equipo')
            ->orderBy('nombre');

        if (! $request->boolean('con_inactivos')) {
            $query->activos();
        }

        if ($request->filled('id_equipo')) {
            $query->where('id_equipo', (int) $request->query('id_equipo'));
        }

        if ($search = $request->query('q')) {
            $query->where('nombre', 'like', '%'.addcslashes($search, '%_\\').'%');
        }

        if ($request->boolean('with_equipo')) {
            $query->with('equipo.federacion');
        }

        return JugadorResource::collection($query->paginate($perPage));
    }

    public function store(StoreJugadorRequest $request)
    {
        $jugador = Jugador::create([
            ...$request->validated(),
            'estado' => 1,
        ]);

        return (new JugadorResource($jugador->load('equipo')))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Request $request, Jugador $jugador)
    {
        if (! $request->boolean('con_inactivos') && (int) $jugador->estado !== 1) {
            abort(Response::HTTP_NOT_FOUND);
        }

        $jugador->load('equipo');

        return new JugadorResource($jugador);
    }

    public function update(UpdateJugadorRequest $request, Jugador $jugador)
    {
        $jugador->update($request->validated());

        return new JugadorResource($jugador->fresh()->load('equipo'));
    }

    public function destroy(Jugador $jugador)
    {
        if ((int) $jugador->estado !== 1) {
            return response()->json([
                'message' => 'El jugador ya estaba inactivo.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $jugador->update(['estado' => 0]);

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
