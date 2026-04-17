<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class QuickMail extends Mailable
{
    use Queueable, SerializesModels;

    public $subjectStr;

    public $messageStr;

    public $tenant;

    public function __construct($subjectStr, $messageStr, $tenant)
    {
        $this->subjectStr = $subjectStr;
        $this->messageStr = $messageStr;
        $this->tenant = $tenant;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subjectStr,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.quick_send',
            with: [
                'messageStr' => $this->messageStr,
                'tenant' => $this->tenant,
            ],
        );
    }
}
