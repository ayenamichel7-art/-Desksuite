<x-mail::message>
# {{ $subjectStr }}

{{ $messageStr }}

<x-mail::button :url="config('app.url')">
Accéder à Desksuite
</x-mail::button>

Cordialement,<br>
{{ $tenant->brand_name ?? $tenant->name }} (via DeskSuite Hub)
</x-mail::message>
