<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
        'http://desksuite.localhost',
        'https://*.desksuite.localhost',
    ],
    'allowed_origins_patterns' => [
        '#^https?://.*\.desksuite\.localhost$#', // Wildcard multi-tenant
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 3600,
    'supports_credentials' => true,
];
