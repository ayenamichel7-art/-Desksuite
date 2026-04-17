<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tenantId = auth()->user()->currentTenant()->id;

        // 1. Get raw events
        $events = Event::where('tenant_id', $tenantId)->get()->map(function ($e) {
            return [
                'id' => $e->id,
                'type' => 'event',
                'title' => $e->title,
                'description' => $e->description,
                'start' => $e->start_at->toIso8601String(),
                'end' => $e->end_at ? $e->end_at->toIso8601String() : $e->start_at->addHours(1)->toIso8601String(),
                'color' => $e->color ?? '#3b82f6',
                'location' => $e->location,
                'allDay' => $e->is_full_day,
            ];
        });

        // 2. Get tasks with due dates (as milestones)
        $tasks = Task::where('tenant_id', $tenantId)
            ->whereNotNull('due_date')
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'type' => 'task',
                    'title' => '📌 '.$t->title,
                    'description' => 'Tâche de projet',
                    'start' => $t->due_date->toIso8601String(),
                    'end' => $t->due_date->addHours(1)->toIso8601String(),
                    'color' => '#ef4444', // Red for tasks
                    'allDay' => true,
                ];
            });

        return response()->json($events->concat($tasks));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'location' => 'nullable|string',
            'color' => 'nullable|string',
            'start_at' => 'required|date',
            'end_at' => 'nullable|date',
            'is_full_day' => 'boolean',
            'task_id' => 'nullable|exists:tasks,id',
        ]);

        $event = auth()->user()->currentTenant()->events()->create([
            'id' => Str::uuid(),
            'created_by' => auth()->id(),
            ...$validated,
        ]);

        return response()->json($event, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Event $event)
    {
        $this->authorizeTenant($event->tenant_id);

        return response()->json($event);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Event $event)
    {
        $this->authorizeTenant($event->tenant_id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string',
            'description' => 'nullable|string',
            'location' => 'nullable|string',
            'color' => 'nullable|string',
            'start_at' => 'sometimes|required|date',
            'end_at' => 'nullable|date',
            'is_full_day' => 'boolean',
        ]);

        $event->update($validated);

        return response()->json($event);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Event $event)
    {
        $this->authorizeTenant($event->tenant_id);
        $event->delete();

        return response()->json(null, 204);
    }

    private function authorizeTenant($id)
    {
        if ($id !== auth()->user()->currentTenant()->id) {
            abort(403);
        }
    }
}
