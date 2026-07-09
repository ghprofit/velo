<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\Setting;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Some MySQL/MariaDB shared-hosting configs cap index key length below what
        // VARCHAR(255)+utf8mb4 needs, causing "Specified key was too long" on migrations.
        Schema::defaultStringLength(191);

        View::composer('layouts.navigation', function ($view) {
            $view->with('allCategories', Category::where('active', true)->whereNull('parent_id')
                ->orderByRaw("FIELD(name, 'Women', 'Men', 'Kids', 'Sports')")
                ->get());
        });

        // Share color settings with all views
        View::composer('*', function ($view) {
            $view->with('siteColors', [
                'primary' => Setting::get('primary_color', '#111111'),
                'secondary' => Setting::get('secondary_color', '#10b981'),
            ]);
            $view->with('siteCurrency', [
                'code' => Setting::get('currency', 'USD'),
                'symbol' => Setting::get('currency_symbol', '$'),
            ]);
            $view->with('siteName', Setting::get('site_name', 'STRYD'));
        });
    }
}
