<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    public $invoice;

    public $pdfPath;

    public function __construct($invoice, $pdfPath)
    {
        $this->invoice = $invoice;
        $this->pdfPath = $pdfPath;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Nouvelle Facture '.$this->invoice->reference,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.invoices.sent',
            with: [
                'invoice' => $this->invoice,
                'tenant' => $this->invoice->tenant,
            ],
        );
    }

    public function attachments(): array
    {
        return [
            Attachment::fromPath($this->pdfPath)
                ->as('Facture_'.$this->invoice->reference.'.pdf')
                ->withMime('application/pdf'),
        ];
    }
}
