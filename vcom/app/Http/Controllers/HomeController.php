<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Setting;
use App\Models\HeroBanner;

class HomeController extends Controller
{
    public function index()
    {
        $categories = Category::where('active', true)
            ->whereNull('parent_id')
            ->withCount('products')
            ->get();

        $featuredProducts = Product::active()->featured()
            ->with('primaryImage', 'category')
            ->take(8)->get();

        $saleProducts = Product::active()
            ->whereNotNull('sale_price')
            ->whereColumn('sale_price', '<', 'price')
            ->with('primaryImage', 'category', 'variants')
            ->take(6)->get();

        $newArrivals = Product::active()
            ->with('primaryImage', 'category')
            ->latest()
            ->take(8)->get();

        // Get site settings
        $settings = [
            'hero_title' => Setting::get('hero_title', 'Step Into Style'),
            'hero_subtitle' => Setting::get('hero_subtitle', 'New season sneakers for every stride'),
            'hero_image' => Setting::get('hero_image'),
            'primary_color' => Setting::get('primary_color', '#111111'),
            'secondary_color' => Setting::get('secondary_color', '#10b981'),
            'show_banner' => Setting::get('show_banner', '1'),
            'banner_text' => Setting::get('banner_text', 'Free shipping on orders over GH₵50!'),
        ];

        // Get hero banners
        $heroBanners = HeroBanner::where('active', true)
            ->orderBy('sort_order')
            ->get();

        return view('home', compact(
            'categories',
            'featuredProducts',
            'saleProducts',
            'newArrivals',
            'settings',
            'heroBanners'
        ));
    }
}
