<?php

// ============================================================
// ARKZEN GENERATED MAILABLE — CertificateMail
// Tatemono: certflow
// Subject: Your Certificate is Ready 🎓
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-09T12:36:22.856949Z
// ============================================================

namespace App\Mail\Arkzen\Certflow;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CertificateMail extends Mailable
{
    use Queueable, SerializesModels;

    public readonly string $submission_token;
    public readonly string $template_name;
    public readonly string $recipient_name;
    public readonly string $verify_url;
    public readonly string $qr_code_url;

    public function __construct(string $submission_token = '', string $template_name = '', string $recipient_name = '', string $verify_url = '', string $qr_code_url = '')
    {
        $this->submission_token = $submission_token;
        $this->template_name = $template_name;
        $this->recipient_name = $recipient_name;
        $this->verify_url = $verify_url;
        $this->qr_code_url = $qr_code_url;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Certificate is Ready 🎓',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.arkzen.certflow.certificate',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
