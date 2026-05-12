<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreEquipoRequest;
use App\Http\Requests\Api\V1\StoreFederacionRequest;
use App\Http\Requests\Api\V1\UpdateFederacionRequest;
use App\Http\Resources\Api\V1\EquipoResource;
use App\Http\Resources\Api\V1\FederacionResource;
use App\Models\Federacion;
use App\Models\Jugador;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class FederacionController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);

        $query = Federacion::query()
            ->withCount(['equipos' => function ($q) use ($request) {
                if (! $request->boolean('con_inactivos')) {
                    $q->activos();
                }
            }])
            ->orderBy('nombre');

        if (! $request->boolean('con_inactivos')) {
            $query->activas();
        }

        if ($search = $request->query('q')) {
            $query->where('nombre', 'like', '%'.addcslashes($search, '%_\\').'%');
        }

        if ($request->boolean('with_equipos')) {
            $query->with(['equipos' => function ($q) use ($request) {
                if (! $request->boolean('con_inactivos')) {
                    $q->activos();
                }
                $q->orderBy('nombre');
            }]);
        }

        return FederacionResource::collection($query->paginate($perPage));
    }

    public function store(StoreFederacionRequest $request)
    {
        $federacion = Federacion::create([
            ...$request->validated(),
            'estado' => 1,
        ]);

        return (new FederacionResource($federacion->loadCount('equipos')))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Request $request, Federacion $federacion)
    {
        if (! $request->boolean('con_inactivos') && (int) $federacion->estado !== 1) {
            abort(Response::HTTP_NOT_FOUND);
        }

        $federacion->loadCount(['equipos' => function ($q) use ($request) {
            if (! $request->boolean('con_inactivos')) {
                $q->activos();
            }
        }]);

        if ($request->boolean('with_equipos')) {
            $federacion->load(['equipos' => function ($q) use ($request) {
                if (! $request->boolean('con_inactivos')) {
                    $q->activos();
                }
                $q->orderBy('nombre');
            }]);
        }

        return new FederacionResource($federacion);
    }

    public function update(UpdateFederacionRequest $request, Federacion $federacion)
    {
        $federacion->update($request->validated());

        return new FederacionResource($federacion->fresh()->loadCount('equipos'));
    }

    public function destroy(Federacion $federacion)
    {
        if ((int) $federacion->estado !== 1) {
            return response()->json([
                'message' => 'La federación ya estaba inactiva.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        DB::transaction(function () use ($federacion) {
            $equipoIds = $federacion->equipos()->pluck('id_equipo');
            Jugador::whereIn('id_equipo', $equipoIds)->update(['estado' => 0]);
            $federacion->equipos()->update(['estado' => 0]);
            $federacion->update(['estado' => 0]);
        });

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    public function equipos(Request $request, Federacion $federacion)
    {
        if (! $request->boolean('con_inactivos') && (int) $federacion->estado !== 1) {
            abort(Response::HTTP_NOT_FOUND);
        }

        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);

        $query = $federacion->equipos()->orderBy('nombre');

        if (! $request->boolean('con_inactivos')) {
            $query->activos();
        }

        if ($search = $request->query('q')) {
            $query->where('nombre', 'like', '%'.addcslashes($search, '%_\\').'%');
        }

        if ($request->boolean('with_jugadores')) {
            $query->with(['jugadores' => function ($q) use ($request) {
                if (! $request->boolean('con_inactivos')) {
                    $q->activos();
                }
                $q->orderBy('nombre');
            }]);
        }

        return EquipoResource::collection($query->paginate($perPage));
    }

    public function storeEquipo(StoreEquipoRequest $request, Federacion $federacion)
    {
        if ((int) $federacion->estado !== 1) {
            abort(Response::HTTP_NOT_FOUND);
        }

        $equipo = $federacion->equipos()->create([
            'nombre' => $request->validated('nombre'),
            'estado' => 1,
        ]);

        return (new EquipoResource($equipo->load('federacion')))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }
}
