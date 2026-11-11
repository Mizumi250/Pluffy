<?php

// ============================================================
// ARKZEN GENERATED NOTIFICATION — RecordAlertNotification
// Tatemono: express-test-2
// Channels: database, mail, broadcast
// Broadcast channel type: private
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:32.097491Z
// ============================================================

namespace App\Notifications\Arkzen\ExpressTest2;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Broadcasting\PrivateChannel;

class RecordAlertNotification extends Notification implements ShouldQueue
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
        return ['database', 'mail', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Record alert')
            ->line('A record needs your attention')
            ->action('View', url('/'))
            ->line('Thank you for using our application.');
    }

    public function toBroadcast(object $notifiable): array
    {
        return [
            'message' => 'A record needs your attention',
            'data'    => $this->data,
        ];
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel('express-test-2.' . $this->notifiable->id)];
    }

    public function broadcastAs(): string
    {
        return 'express-test-2.notification';
    }

    public function toArray(object $notifiable): array
    {
        return array_merge([
            'type'     => 'ExpressTest2\\RecordAlertNotification',
            'message'  => 'A record needs your attention',
            'tatemono' => 'express-test-2',
        ], $this->data);
    }
}
