<?php

// ============================================================
// ARKZEN GENERATED REQUEST — AssistantChatRequest
// Tatemono: ollama-studio
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T07:19:53.924830Z
// ============================================================

namespace App\Http\Requests\Arkzen\OllamaStudio;

use Illuminate\Foundation\Http\FormRequest;

class AssistantChatRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'prompt' => 'required|string|max:4000',
        ];
    }

    public function messages(): array { return []; }
}
