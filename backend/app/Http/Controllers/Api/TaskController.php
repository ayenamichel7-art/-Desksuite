<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * Liste des tâches par tenant (Groupées par statut).
     */
    public function index(Request $request)
    {
        $query = Task::query();

        $stats = [
            'total' => (clone $query)->count(),
            'done' => (clone $query)->where('status', 'done')->count(),
            'pending' => (clone $query)->where('status', '!=', 'done')->count(),
        ];

        $tasks = $query->orderBy('updated_at', 'desc')
            ->paginate($request->query('per_page', 20));

        return response()->json([
            'tasks' => $tasks,
            'stats' => $stats,
        ]);
    }

    /**
     * Création d'une nouvelle tâche.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high',
            'status' => 'required|in:todo,in_progress,done',
            'due_date' => 'nullable|date',
        ]);

        $task = Task::create($validated);

        return response()->json($task, 201);
    }

    /**
     * Mise à jour rapide (changement de statut).
     */
    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:todo,in_progress,done',
            'priority' => 'sometimes|in:low,medium,high',
            'description' => 'sometimes|nullable|string',
        ]);

        $task->update($validated);

        return response()->json($task);
    }

    /**
     * Suppression.
     */
    public function destroy($id)
    {
        $task = Task::findOrFail($id);
        $task->delete();

        return response()->json(null, 204);
    }

    /**
     * Démarrer/Arrêter le chronomètre pour le suivi du temps.
     */
    public function toggleTimer(Request $request, $id)
    {
        $task = Task::findOrFail($id);

        if ($task->last_started_at) {
            // Le chronomètre tournait, on l'arrête
            $elapsed = now()->diffInSeconds($task->last_started_at);
            $task->time_spent += $elapsed;
            $task->last_started_at = null;
        } else {
            // On démarre le chronomètre
            $task->last_started_at = now();
            // Le statut passe automatiquement 'en cours' si on travaille dessus
            if ($task->status === 'todo') {
                $task->status = 'in_progress';
            }
        }

        $task->save();

        return response()->json([
            'task' => $task,
            'is_running' => $task->last_started_at !== null,
        ]);
    }
}
