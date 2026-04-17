<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Form;
use App\Models\FormResponse;
use Illuminate\Http\Request;

class FormController extends Controller
{
    /**
     * Lister les formulaires du tenant.
     */
    public function index()
    {
        $forms = Form::withCount('responses')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($forms);
    }

    /**
     * Créer un formulaire.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'schema' => 'required|array',
            'schema.*.label' => 'required|string',
            'schema.*.type' => 'required|in:text,number,email,textarea,select,radio,checkbox,date,file',
            'schema.*.required' => 'boolean',
            'schema.*.options' => 'nullable|array', // Pour select / radio / checkbox
        ]);

        $form = Form::create($validated);

        AuditLog::log('FORM_CREATED', ['form_id' => $form->id, 'title' => $form->title]);

        return response()->json($form, 201);
    }

    /**
     * Voir un formulaire + ses réponses.
     */
    public function show(Form $form)
    {
        return response()->json($form->load('responses'));
    }

    /**
     * Soumettre une réponse à un formulaire.
     */
    public function submit(Request $request, Form $form)
    {
        if (! $form->is_active) {
            return response()->json(['error' => 'This form is no longer accepting responses.'], 403);
        }

        $validated = $request->validate([
            'data' => 'required|array',
        ]);

        $response = FormResponse::create([
            'form_id' => $form->id,
            'tenant_id' => auth()->user()->current_tenant_id,
            'data' => $validated['data'],
        ]);

        AuditLog::log('FORM_RESPONSE_SUBMITTED', [
            'form_id' => $form->id,
            'response_id' => $response->id,
        ]);

        return response()->json(['message' => 'Response submitted.', 'response' => $response], 201);
    }

    /**
     * Mise à jour du formulaire.
     */
    public function update(Request $request, Form $form)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'schema' => 'sometimes|array',
            'is_active' => 'sometimes|boolean',
        ]);

        $form->update($validated);

        return response()->json($form->fresh());
    }

    /**
     * Supprimer un formulaire.
     */
    public function destroy(Form $form)
    {
        $form->delete();

        AuditLog::log('FORM_DELETED', ['form_id' => $form->id]);

        return response()->json(['message' => 'Form deleted.']);
    }
}
