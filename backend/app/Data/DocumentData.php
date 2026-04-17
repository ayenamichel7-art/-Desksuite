<?php

namespace App\Data;

use Spatie\LaravelData\Data;

class DocumentData extends Data
{
    public function __construct(
        public ?string $id,
        public string $type, // doc, sheet, slide
        public string $name,
        public ?array $content,
        public ?string $last_modified_by,
        public ?string $created_at,
        public ?string $updated_at,
    ) {}
}
