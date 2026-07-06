FROM php:8.2-cli-alpine

# Install system dependencies
RUN apk add --no-cache git unzip bash

# Install PHP extension installer helper
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

# Install PHP extensions required by Laravel (including mbstring, zip, gd, etc.)
RUN install-php-extensions gd pdo_mysql bcmath zip mbstring exif pcntl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy the backend code
COPY . .

# Install PHP packages (skipping scripts and ignoring platform requirements to avoid build errors)
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts --ignore-platform-reqs

# Create storage directory structure and set permissions
RUN mkdir -p /var/www/storage/framework/cache/data \
    && mkdir -p /var/www/storage/framework/sessions \
    && mkdir -p /var/www/storage/framework/testing \
    && mkdir -p /var/www/storage/framework/views \
    && mkdir -p /var/www/storage/logs \
    && chmod -R 777 /var/www/storage /var/www/bootstrap/cache

# Expose port and start Laravel
EXPOSE 8000

CMD php artisan package:discover --ansi && php artisan serve --host=0.0.0.0 --port=$PORT
