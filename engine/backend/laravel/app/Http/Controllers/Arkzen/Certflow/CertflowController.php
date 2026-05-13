<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — CertflowController
// Tatemono: certflow
// Type: Custom Route Controller (no model/resource)
// DO NOT EDIT DIRECTLY. Edit the @arkzen:routes block in the tatemono instead.
// Generated: 2026-05-13T10:27:06.198220Z
// ============================================================

namespace App\Http\Controllers\Arkzen\Certflow;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class CertflowController extends Controller
{
    /**
     * POST /api/certflow/templates/upload
     */
    public function upload_template(Request $request, mixed ...$params): JsonResponse
    {

        $request->validate([
            'file' => 'required|file|mimes:png,jpg,jpeg,pdf|max:10240',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'global_font' => 'sometimes|string|max:100',
        ]);
        $file = $request->file('file');
        $ext  = $file->getClientOriginalExtension();
        $path = $file->storeAs('certflow/templates', uniqid('tmpl_', true) . '.' . $ext, 'public');
        $token = \Illuminate\Support\Str::random(32);
        $template = \App\Models\Arkzen\Certflow\Template::create([
            'name'        => $request->input('name'),
            'description' => $request->input('description'),
            'file_path'   => '/storage/' . $path,
            'file_type'   => in_array($ext, ['pdf']) ? 'pdf' : 'png',
            'global_font' => $request->input('global_font', 'Inter'),
            'is_default'  => false,
            'link_token'  => $token,
        ]);
        return response()->json(['template' => $template], 201);
    }

    /**
     * POST /api/certflow/templates/{id}/generate-link
     */
    public function generate_link(Request $request, mixed ...$params): JsonResponse
    {
        $id = $params[0] ?? null;

        $id = $params[0] ?? null;
        $template = \App\Models\Arkzen\Certflow\Template::findOrFail($id);
        if (!$template->link_token) {
            $template->update(['link_token' => \Illuminate\Support\Str::random(32)]);
        }
        $link = url('/certflow/fill/' . $template->link_token);
        return response()->json(['link' => $link, 'token' => $template->link_token]);
    }

    /**
     * GET /api/certflow/fill/{token}
     */
    public function get_fill_form(Request $request, mixed ...$params): JsonResponse
    {
        $token = $params[0] ?? null;

        $token = $params[0] ?? null;
        $template = \App\Models\Arkzen\Certflow\Template::where('link_token', $token)->firstOrFail();
        $fields   = \App\Models\Arkzen\Certflow\Field::where('template_id', $template->id)
                        ->orderBy('layer_order')
                        ->get();
        return response()->json(['template' => $template, 'fields' => $fields]);
    }

    /**
     * POST /api/certflow/fill/{token}/submit
     */
    public function submit_form(Request $request, mixed ...$params): JsonResponse
    {
        $token = $params[0] ?? null;

        $token    = $params[0] ?? null;
        $template = \App\Models\Arkzen\Certflow\Template::where('link_token', $token)->firstOrFail();
        $fields   = \App\Models\Arkzen\Certflow\Field::where('template_id', $template->id)->get();
        $rules    = [];
        foreach ($fields as $field) {
            if ($field->is_required) {
                $rules[$field->label] = 'required|string|max:500';
            } else {
                $rules[$field->label] = 'nullable|string|max:500';
            }
        }
        $validated   = $request->validate($rules);
        $subToken    = \Illuminate\Support\Str::random(48);
        $recipientEmail = $request->input('email') ?? null;
        foreach ($validated as $key => $val) {
            if (filter_var($val, FILTER_VALIDATE_EMAIL)) {
                $recipientEmail = $val;
                break;
            }
        }
        $submission = \App\Models\Arkzen\Certflow\Submission::create([
            'template_id'      => $template->id,
            'submission_token' => $subToken,
            'form_data'        => json_encode($validated),
            'recipient_email'  => $recipientEmail,
            'email_sent'       => false,
        ]);
        $verifyUrl = url('/certflow/verify/' . $subToken);
        $qrApiUrl  = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($verifyUrl);
        $submission->update(['qr_code' => $qrApiUrl]);
        if ($recipientEmail) {
            try {
                \Mail::to($recipientEmail)->send(new \App\Mail\Arkzen\Certflow\CertificateMail($submission, $template, $validated));
                $submission->update(['email_sent' => true, 'email_sent_at' => now()]);
            } catch (\Throwable $e) {}
        }
        return response()->json([
            'submission_token' => $subToken,
            'qr_code'          => $qrApiUrl,
            'verify_url'       => $verifyUrl,
            'email_sent'       => $submission->email_sent,
        ]);
    }

    /**
     * GET /api/certflow/verify/{token}
     */
    public function verify_submission(Request $request, mixed ...$params): JsonResponse
    {
        $token = $params[0] ?? null;

        $token      = $params[0] ?? null;
        $submission = \App\Models\Arkzen\Certflow\Submission::where('submission_token', $token)->firstOrFail();
        $template   = \App\Models\Arkzen\Certflow\Template::find($submission->template_id);
        \App\Models\Arkzen\Certflow\Scan::create([
            'submission_id' => $submission->id,
            'scanned_at'    => now(),
            'ip_address'    => $request->ip(),
            'user_agent'    => $request->userAgent(),
        ]);
        return response()->json([
            'valid'      => true,
            'submission' => $submission,
            'template'   => $template,
            'form_data'  => json_decode($submission->form_data, true),
        ]);
    }

}
