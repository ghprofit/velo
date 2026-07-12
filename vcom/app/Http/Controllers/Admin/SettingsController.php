<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\HeroBanner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = [
            'site_name' => Setting::get('site_name', 'STRYD'),
            'hero_title' => Setting::get('hero_title', 'Step Into Style'),
            'hero_subtitle' => Setting::get('hero_subtitle', 'New season sneakers for every stride'),
            'hero_image' => Setting::get('hero_image'),
            'primary_color' => Setting::get('primary_color', '#111111'),
            'secondary_color' => Setting::get('secondary_color', '#10b981'),
            'banner_text' => Setting::get('banner_text', 'Free shipping on orders over GH₵50!'),
            'show_banner' => Setting::get('show_banner', '1'),
            'tinymce_api_key' => Setting::get('tinymce_api_key', ''),
            'currency' => Setting::get('currency', 'GHS'),
            'currency_symbol' => Setting::get('currency_symbol', '₵'),
            'payment_method_cod' => Setting::get('payment_method_cod', '1'),
            'payment_method_paystack' => Setting::get('payment_method_paystack', '1'),
        ];

        $heroBanners = HeroBanner::orderBy('sort_order')->get();

        return view('admin.settings.index', compact('settings', 'heroBanners'));
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'site_name' => 'required|string|max:255',
            'hero_title' => 'required|string|max:255',
            'hero_subtitle' => 'nullable|string|max:500',
            'hero_image' => 'nullable|image|max:5120',
            'primary_color' => 'required|string|max:7',
            'secondary_color' => 'required|string|max:7',
            'banner_text' => 'nullable|string|max:255',
            'show_banner' => 'boolean',
            'tinymce_api_key' => 'nullable|string|max:255',
            'currency' => 'required|string|max:10',
            'currency_symbol' => 'required|string|max:10',
            'payment_method_cod' => 'boolean',
            'payment_method_paystack' => 'boolean',
        ]);

        // Ensure at least one payment method is enabled
        if (!$request->has('payment_method_cod') && !$request->has('payment_method_paystack')) {
            return back()->withErrors(['payment_methods' => 'At least one payment method must be enabled.'])->withInput();
        }

        // Handle hero image upload
        if ($request->hasFile('hero_image')) {
            // Delete old image if exists
            $oldImage = Setting::get('hero_image');
            if ($oldImage) {
                Storage::disk('public')->delete($oldImage);
            }

            $path = $request->file('hero_image')->store('settings', 'public');
            Setting::set('hero_image', $path);
        }

        // Save other settings
        Setting::set('site_name', $validated['site_name']);
        Setting::set('hero_title', $validated['hero_title']);
        Setting::set('hero_subtitle', $validated['hero_subtitle'] ?? '');
        Setting::set('primary_color', $validated['primary_color']);
        Setting::set('secondary_color', $validated['secondary_color']);
        Setting::set('banner_text', $validated['banner_text'] ?? '');
        Setting::set('show_banner', $request->has('show_banner') ? '1' : '0');
        Setting::set('tinymce_api_key', $validated['tinymce_api_key'] ?? '');
        Setting::set('currency', $validated['currency']);
        Setting::set('currency_symbol', $validated['currency_symbol']);
        Setting::set('payment_method_cod', $request->has('payment_method_cod') ? '1' : '0');
        Setting::set('payment_method_paystack', $request->has('payment_method_paystack') ? '1' : '0');

        // Clear cache
        Setting::clearCache();

        return back()->with('success', 'Settings updated successfully!');
    }

    public function uploadHeroBanners(Request $request)
    {
        $request->validate([
            'hero_banners' => 'required|array|max:10',
            'hero_banners.*' => 'image|max:5120',
        ]);

        if ($request->hasFile('hero_banners')) {
            $maxOrder = HeroBanner::max('sort_order') ?? 0;

            foreach ($request->file('hero_banners') as $index => $image) {
                $path = $image->store('hero-banners', 'public');
                HeroBanner::create([
                    'image_path' => $path,
                    'sort_order' => $maxOrder + $index + 1,
                    'active' => true,
                ]);
            }
        }

        return back()->with('success', 'Hero banners uploaded successfully!');
    }

    public function updateHeroBanner(Request $request, HeroBanner $banner)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'button_text' => 'nullable|string|max:100',
            'button_link' => 'nullable|string|max:255',
            'active' => 'boolean',
            'show_text' => 'boolean',
        ]);

        $validated['active'] = $request->has('active');
        $validated['show_text'] = $request->has('show_text');
        $banner->update($validated);

        return back()->with('success', 'Hero banner updated successfully!');
    }

    public function deleteHeroBanner(HeroBanner $banner)
    {
        Storage::disk('public')->delete($banner->image_path);
        $banner->delete();

        return back()->with('success', 'Hero banner deleted successfully!');
    }
}
