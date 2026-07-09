<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $men = Category::where('name', 'Men')->first();
        $women = Category::where('name', 'Women')->first();
        $kids = Category::where('name', 'Kids')->first();
        $sports = Category::where('name', 'Sports')->first();

        $sizesAdult = ['40', '40.5', '41', '42', '42.5', '43', '44', '44.5', '45', '46'];
        $sizesKids = ['28', '29', '30', '31', '32', '33', '34'];

        $products = [
            ['category_id' => $men->id, 'name' => "Men's Classic Runner", 'description' => "A timeless low-top runner built for everyday comfort. Breathable mesh upper with a cushioned foam midsole.", 'price' => 89.99, 'sale_price' => 69.99, 'sku' => 'MEN-001', 'featured' => true,
                'colors' => ['White' => '#f5f5f5', 'Black' => '#111111', 'Navy' => '#1e3a5f']],
            ['category_id' => $men->id, 'name' => "Men's Urban Sneaker", 'description' => "Street-ready silhouette with a durable rubber outsole and padded collar for all-day wear.", 'price' => 79.99, 'sale_price' => null, 'sku' => 'MEN-002', 'featured' => false,
                'colors' => ['Grey' => '#9ca3af', 'Black' => '#111111']],
            ['category_id' => $men->id, 'name' => "Men's Leather Low-Top", 'description' => "Premium leather upper with a minimalist design and stitched detailing for a clean, versatile look.", 'price' => 109.99, 'sale_price' => null, 'sku' => 'MEN-003', 'featured' => true,
                'colors' => ['White' => '#f5f5f5', 'Tan' => '#c9a877']],

            ['category_id' => $women->id, 'name' => "Women's Cloud Trainer", 'description' => "Ultra-light trainer with a knit upper that moves with your foot. Responsive cushioning for daily runs.", 'price' => 94.99, 'sale_price' => 74.99, 'sku' => 'WMN-001', 'featured' => true,
                'colors' => ['White' => '#f5f5f5', 'Blush' => '#e8b4bc', 'Black' => '#111111']],
            ['category_id' => $women->id, 'name' => "Women's Retro Sneaker", 'description' => "A retro-inspired court shoe with a padded tongue and classic rubber cupsole.", 'price' => 84.99, 'sale_price' => null, 'sku' => 'WMN-002', 'featured' => false,
                'colors' => ['Cream' => '#f1e7d0', 'Black' => '#111111']],
            ['category_id' => $women->id, 'name' => "Women's Slip-On Knit", 'description' => "Laceless slip-on with a stretch-knit upper for easy on-off comfort.", 'price' => 69.99, 'sale_price' => null, 'sku' => 'WMN-003', 'featured' => false,
                'colors' => ['Grey' => '#9ca3af', 'Rose' => '#d98ea1']],

            ['category_id' => $kids->id, 'name' => "Kids' Light-Up Sneaker", 'description' => "Fun light-up sole with hook-and-loop straps for easy wear. Durable outsole for playground days.", 'price' => 49.99, 'sale_price' => null, 'sku' => 'KID-001', 'featured' => true,
                'colors' => ['White' => '#f5f5f5', 'Black' => '#111111'], 'sizes' => $sizesKids],
            ['category_id' => $kids->id, 'name' => "Kids' Velcro Trainer", 'description' => "Lightweight everyday trainer with adjustable straps built for growing feet.", 'price' => 44.99, 'sale_price' => null, 'sku' => 'KID-002', 'featured' => false,
                'colors' => ['Grey' => '#9ca3af'], 'sizes' => $sizesKids],

            ['category_id' => $sports->id, 'name' => "Pro Running Shoe", 'description' => "Engineered for performance with a responsive foam plate and breathable engineered mesh.", 'price' => 119.99, 'sale_price' => 99.99, 'sku' => 'SPT-001', 'featured' => true,
                'colors' => ['Black' => '#111111', 'White' => '#f5f5f5', 'Red' => '#c0392b']],
            ['category_id' => $sports->id, 'name' => "Trail Grip Sneaker", 'description' => "Rugged outsole with multi-directional lugs for confident grip on and off the trail.", 'price' => 99.99, 'sale_price' => null, 'sku' => 'SPT-002', 'featured' => false,
                'colors' => ['Grey' => '#9ca3af', 'Black' => '#111111']],
        ];

        foreach ($products as $data) {
            $colors = $data['colors'];
            $sizes = $data['sizes'] ?? $sizesAdult;
            unset($data['colors'], $data['sizes']);

            $product = Product::create([
                ...$data,
                'stock' => 0,
            ]);

            foreach ($colors as $colorName => $hex) {
                $color = $product->colors()->create([
                    'name' => $colorName,
                    'hex_color' => $hex,
                    'sort_order' => 0,
                ]);

                foreach ($sizes as $index => $size) {
                    $color->variants()->create([
                        'product_id' => $product->id,
                        'size' => $size,
                        // Occasionally leave a size out of stock to exercise the "sold out" state.
                        'stock' => ($index % 5 === 4) ? 0 : rand(3, 20),
                    ]);
                }
            }
        }
    }
}
