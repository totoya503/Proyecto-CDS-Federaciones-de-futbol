<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreEquipoRequest;
use App\Http\Requests\Api\V1\StoreJugadorRequest;
use App\Http\Requests\Api\V1\UpdateEquipoRequest;
use App\Http\Resources\Api\V1\EquipoResource;
use App\Http\Resources\Api\V1\JugadorResource;
use App\Models\Equipo;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class EquipoController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);

        $query = Equipo::query()
            ->with('federacion')
            ->withCount(['jugadores' => function ($q) use ($request) {
                if (! $request->boolean('con_inactivos')) {
                    $q->activos();
                }
            }])
            ->orderBy('nombre');

        if (! $request->boolean('con_inactivos')) {
            $query->activos();
        }

        if ($request->filled('id_federacion')) {
            $query->where('id_federacion', (int) $request->query('id_federacion'));
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

    public function store(StoreEquipoRequest $request)
    {
        $equipo = Equipo::create([
            ...$request->validated(),
            'estado' => 1,
        ]);

        return (new EquipoResource($equipo->load('federacion')))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Request $request, Equipo $equipo)
    {
        if (! $request->boolean('con_inactivos') && (int) $equipo->estado !== 1) {
            abort(Response::HTTP_NOT_FOUND);
        }

        $equipo->load('federacion');
        $equipo->loadCount(['jugadores' => function ($q) use ($request) {
            if (! $request->boolean('con_inactivos')) {
                $q->activos();
            }
        }]);

        if ($request->boolean('with_jugadores')) {
            $equipo->load(['jugadores' => function ($q) use ($request) {
                if (! $request->boolean('con_inactivos')) {
                    $q->activos();
                }
                $q->orderBy('nombre');
            }]);
        }

        return new EquipoResource($equipo);
    }

    public function update(UpdateEquipoRequest $request, Equipo $equipo)
    {
        $equipo->update($request->validated());

        return new EquipoResource($equipo->fresh()->load('federacion')->loadCount('jugadores'));
    }

    public function destroy(Equipo $equipo)
    {
        if ((int) $equipo->estado !== 1) {
            return response()->json([
                'message' => 'El equipo ya estaba inactivo.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        DB::transaction(function () use ($equipo) {
            $equipo->jugadores()->update(['estado' => 0]);
            $equipo->update(['estado' => 0]);
        });

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    public function jugadores(Request $request, Equipo $equipo)
    {
        if (! $request->boolean('con_inactivos') && (int) $equipo->estado !== 1) {
            abort(Response::HTTP_NOT_FOUND);
        }

        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);

        $query = $equipo->jugadores()->orderBy('nombre');

        if (! $request->boolean('con_inactivos')) {
            $query->activos();
        }

        if ($search = $request->query('q')) {
            $query->where('nombre', 'like', '%'.addcslashes($search, '%_\\').'%');
        }

        if ($request->boolean('with_equipo')) {
            $query->with('equipo.federacion');
        }

        return JugadorResource::collection($query->paginate($perPage));
    }

    public function storeJugador(StoreJugadorRequest $request, Equipo $equipo)
    {
        if ((int) $equipo->estado !== 1) {
            abort(Response::HTTP_NOT_FOUND);
        }

        $jugador = $equipo->jugadores()->create([
            'nombre' => $request->validated('nombre'),
            'fecha_nacimiento' => $request->validated('fecha_nacimiento'),
            'genero' => $request->validated('genero'),
            'estado' => 1,
        ]);

        return (new JugadorResource($jugador->load('equipo')))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }
}
