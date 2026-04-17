FROM php:8.4-alpine

# Set working directory
WORKDIR /var/www/html

# Install system dependencies
RUN apk add --no-cache \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    oniguruma-dev \
    icu-dev \
    postgresql-dev \
    libzip-dev \
    linux-headers \
    libstdc++ \
    busybox-extras

# Install PHP extensions
RUN docker-php-ext-install pdo_pgsql mbstring exif pcntl bcmath gd intl zip opcache

# Install Swoole via Pecl (for Laravel Octane)
RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    openssl-dev brotli-dev curl-dev \
    && pecl install swoole \
    && docker-php-ext-enable swoole \
    && apk del .build-deps

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Expose Octane port
EXPOSE 8000

# Start Octane
CMD ["php", "artisan", "octane:start", "--host=0.0.0.0", "--port=8000", "--server=swoole"]
