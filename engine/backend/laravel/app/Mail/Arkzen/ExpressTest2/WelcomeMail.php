<?php

// ============================================================
// ARKZEN GENERATED MAILABLE — WelcomeMail
// Tatemono: express-test-2
// Subject: Welcome to Express parity
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:32.107669Z
// ============================================================

namespace App\Mail\Arkzen\ExpressTest2;

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
            subject: 'Welcome to Express parity',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.arkzen.express-test-2.welcome',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
