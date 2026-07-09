# PB21 Enterprise

A modern e-commerce platform for professional cleaning supplies, built with Laravel 11 and Tailwind CSS.

## Features

- **Product Management** - Browse cleaning supplies by category with advanced filtering and search
- **Customer Reviews** - Rate and review products with verified purchase badges
- **Wishlist** - Save favorite products for later
- **Shopping Cart** - Easy checkout with PayStack integration
- **User Verification** - Email and SMS verification via FrogAPI
- **Admin Dashboard** - Complete control over products, orders, users, and site settings
- **Customization** - Dynamic color schemes and multi-banner hero sliders
- **Responsive Design** - Mobile-first design with Alpine.js interactions

## Tech Stack

- Laravel 11
- Tailwind CSS
- Alpine.js
- MySQL
- FrogAPI SMS Gateway
- PayStack Payment Gateway

## Installation

```bash
composer install
npm install && npm run build
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

## Admin Access

Access the admin panel at `/admin/dashboard` with admin credentials.

---

**Powered by [GhProfit](https://ghprofit.com)** - Ghana's Leading E-commerce Solutions
