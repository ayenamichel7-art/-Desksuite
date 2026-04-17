<?php

namespace App\Data;

use Spatie\LaravelData\Data;

class FileData extends Data
{
    public function __construct(
        public ?string $id,
        public string $name,
        public ?string $mime_type,
        public ?int $size_bytes,
        public ?string $formatted_size,
        public ?string $folder_id,
        public ?int $version_count,
        public ?bool $is_trashed,
        public ?string $presigned_url,
        public ?string $created_by,
        public ?string $created_at,
        public ?string $updated_at,
    ) {}
}
