<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;

class TenantMailService
{
    /**
     * Configure le mailer à la volée pour utiliser le SMTP du tenant.
     */
    public static function setSmtpConfig(Tenant $tenant)
    {
        if (! $tenant->smtp_host) {
            return false; // Utilise le SMTP par défaut de DeskSuite
        }

        $config = [
            'transport' => 'smtp',
            'host' => $tenant->smtp_host,
            'port' => $tenant->smtp_port ?? 587,
            'encryption' => $tenant->smtp_encryption ?? 'tls',
            'username' => $tenant->smtp_username,
            'password' => $tenant->smtp_password,
            'timeout' => null,
            'auth_mode' => null,
        ];

        Config::set('mail.mailers.tenant_smtp', $config);
        Config::set('mail.from.address', $tenant->smtp_from_address ?? $tenant->email);
        Config::set('mail.from.name', $tenant->smtp_from_name ?? $tenant->brand_name ?? $tenant->name);

        return true;
    }

    /**
     * Envoie un mailable en utilisant le mailer configuré.
     */
    public static function send($tenant, $to, $mailable)
    {
        if (self::setSmtpConfig($tenant)) {
            return Mail::mailer('tenant_smtp')->to($to)->send($mailable);
        }

        // Sinon envoi via DeskSuite Hub
        return Mail::to($to)->send($mailable);
    }
}
