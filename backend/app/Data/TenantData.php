<?php

namespace App\Data;

use Spatie\LaravelData\Data;

class TenantData extends Data
{
    public function __construct(
        public ?string $id,
        public string $name,
        public string $subdomain,
        public ?array $config,
        public ?string $created_at,
    ) {}
}
