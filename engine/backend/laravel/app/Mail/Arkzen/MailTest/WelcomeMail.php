<?php

// ============================================================
// ARKZEN GENERATED MAILABLE — WelcomeMail
// Tatemono: mail-test
// Subject: Welcome to Arkzen
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T08:35:40.160533Z
// ============================================================

namespace App\Mail\Arkzen\MailTest;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public readonly string $username;
    public readonly string $app_name;

    public function __construct(string $username = '', string $app_name = '')
    {
        $this->username = $username;
        $this->app_name = $app_name;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to Arkzen',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.arkzen.mail-test.welcome-mail',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
