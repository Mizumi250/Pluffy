<?php

// ============================================================
// ARKZEN GENERATED NOTIFICATION — DbPingNotification
// Tatemono: fastapi-test
// Channels: database
// Broadcast channel type: private
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:46.552642Z
// ============================================================

namespace App\Notifications\Arkzen\FastapiTest;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class DbPingNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The notifiable entity (user).
     *
     * @var object
     */
    public $notifiable;

    /**
     * Additional data for the notification.
     *
     * @var array
     */
    public array $data;

    /**
     * Create a new notification instance.
     */
    public function __construct(object $notifiable, array $data = [])
    {
        $this->notifiable = $notifiable;
        $this->data       = $data;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }



    public function toArray(object $notifiable): array
    {
        return array_merge([
            'type'     => 'FastapiTest\\DbPingNotification',
            'message'  => 'You have a new database notification',
            'tatemono' => 'fastapi-test',
        ], $this->data);
    }
}
