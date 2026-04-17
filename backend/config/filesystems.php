<?php

return [
    'default' => env('FILESYSTEM_DISK', 's3'),
    'disks' => [
        'local' => [
            'driver' => 'local',
            'root' => storage_path('app/private'),
            'serve' => true,
            'throw' => false,
        ],
        'public' => [
            'driver' => 'local',
            'root' => storage_path('app/public'),
            'url' => env('APP_URL').'/storage',
            'visibility' => 'public',
            'throw' => false,
        ],
        's3' => [
            'driver' => 's3',
            'key' => env('S3_ACCESS_KEY_ID'),
            'secret' => env('S3_SECRET_ACCESS_KEY'),
            'region' => env('S3_REGION', 'us-east-1'),
            'bucket' => env('S3_BUCKET', 'desksuite'),
            'url' => env('S3_URL'),
            'endpoint' => env('S3_ENDPOINT'),
            'use_path_style_endpoint' => env('S3_USE_PATH_STYLE_ENDPOINT', true),
            'throw' => false,
        ],
    ],
    'links' => [
        public_path('storage') => storage_path('app/public'),
    ],
];
