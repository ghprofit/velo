<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\HeroBanner;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;

class ProductMediaSeeder extends Seeder
{
    /**
     * Wires up the real (Pexels-sourced) product photography downloaded into
     * storage/app/public/{products,categories,hero-banners} to the demo catalog.
     */
    public function run(): void
    {
        // A couple of the kids colorways didn't have a matching real photo in the
        // seeded white/black/grey set, so they're renamed here to colors we do
        // have genuine photography for (rather than showing a mismatched swatch).
        $this->renameColor("Kids' Light-Up Sneaker", 'White', 'Teal', '#4fd1c5');
        $this->renameColor("Kids' Light-Up Sneaker", 'Black', 'Red', '#dc2626');
        $this->renameColor("Kids' Velcro Trainer", 'Grey', 'Denim', '#3b5578');

        $map = [
            "Men's Classic Runner" => [
                'primary' => 'white-runner-1.jpg',
                'colors' => [
                    'White' => ['white-runner-1.jpg'],
                    'Black' => ['black-canvas-1.jpg'],
                    'Navy' => ['navy-leather-1.jpg'],
                ],
            ],
            "Men's Urban Sneaker" => [
                'primary' => 'grey-closeup-1.jpg',
                'colors' => [
                    'Grey' => ['grey-closeup-1.jpg'],
                    'Black' => ['black-canvas-1.jpg'],
                ],
            ],
            "Men's Leather Low-Top" => [
                'primary' => 'tan-leather-1.jpg',
                'colors' => [
                    'White' => ['white-court-1.jpg'],
                    'Tan' => ['tan-leather-1.jpg', 'detail-closeup-2.jpg'],
                ],
            ],
            "Women's Cloud Trainer" => [
                'primary' => 'white-studio-1.jpg',
                'colors' => [
                    'White' => ['white-studio-1.jpg'],
                    'Blush' => ['pink-blush-1.jpg'],
                    'Black' => ['black-canvas-1.jpg'],
                ],
            ],
            "Women's Retro Sneaker" => [
                'primary' => 'black-canvas-1.jpg',
                'colors' => [
                    'Cream' => ['cream-court-1.jpg'],
                    'Black' => ['black-canvas-1.jpg'],
                ],
            ],
            "Women's Slip-On Knit" => [
                'primary' => 'rose-dusty-1.jpg',
                'colors' => [
                    'Grey' => ['detail-closeup-3.jpg'],
                    'Rose' => ['rose-dusty-1.jpg'],
                ],
            ],
            "Kids' Light-Up Sneaker" => [
                'primary' => 'kids-colorful-2.jpg',
                'colors' => [
                    'Teal' => ['kids-colorful-1.jpg'],
                    'Red' => ['kids-colorful-2.jpg'],
                ],
            ],
            "Kids' Velcro Trainer" => [
                'primary' => 'kids-colorful-3.jpg',
                'colors' => [
                    'Denim' => ['kids-colorful-3.jpg'],
                ],
            ],
            'Pro Running Shoe' => [
                'primary' => 'red-sneaker-1.jpg',
                'colors' => [
                    'Black' => ['black-canvas-1.jpg'],
                    'White' => ['white-runner-1.jpg'],
                    'Red' => ['red-sneaker-1.jpg', 'detail-closeup-1.jpg'],
                ],
            ],
            'Trail Grip Sneaker' => [
                'primary' => 'grey-closeup-1.jpg',
                'colors' => [
                    'Grey' => ['grey-closeup-1.jpg'],
                    'Black' => ['black-canvas-1.jpg', 'detail-closeup-4.jpg'],
                ],
            ],
        ];

        foreach ($map as $productName => $data) {
            $product = Product::where('name', $productName)->first();
            if (! $product) {
                continue;
            }

            // Clear any previously-seeded images for this product so the command is re-runnable.
            $product->images()->delete();

            foreach ($data['colors'] as $colorName => $files) {
                $color = $product->colors()->where('name', $colorName)->first();
                if (! $color) {
                    continue;
                }

                foreach ($files as $index => $file) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'product_color_id' => $color->id,
                        'image_path' => 'products/' . $file,
                        'is_primary' => false,
                        'sort_order' => $index,
                    ]);
                }
            }

            // Product-level image (no color) used for listing/homepage thumbnails.
            ProductImage::create([
                'product_id' => $product->id,
                'product_color_id' => null,
                'image_path' => 'products/' . $data['primary'],
                'is_primary' => true,
                'sort_order' => 0,
            ]);
        }

        $categoryImages = [
            'Men' => 'category-men.jpg',
            'Women' => 'category-women.jpg',
            'Kids' => 'category-kids.jpg',
            'Sports' => 'category-sports.jpg',
        ];

        foreach ($categoryImages as $name => $file) {
            Category::where('name', $name)->update(['image' => 'categories/' . $file]);
        }

        HeroBanner::query()->delete();

        HeroBanner::create([
            'image_path' => 'hero-banners/hero-lifestyle-1.jpg',
            'title' => 'Step Into Style',
            'subtitle' => 'New season sneakers for every stride',
            'button_text' => 'Shop Now',
            'button_link' => null,
            'sort_order' => 0,
            'active' => true,
            'show_text' => true,
        ]);

        HeroBanner::create([
            'image_path' => 'hero-banners/hero-flatlay-1.jpg',
            'title' => 'Find Your Fit',
            'subtitle' => 'Every color, every size — free delivery over $30',
            'button_text' => 'Explore Collection',
            'button_link' => null,
            'sort_order' => 1,
            'active' => true,
            'show_text' => true,
        ]);
    }

    private function renameColor(string $productName, string $oldName, string $newName, string $hex): void
    {
        $product = Product::where('name', $productName)->first();
        if (! $product) {
            return;
        }

        $target = $product->colors()->where('name', $newName)->first();
        $old = $product->colors()->where('name', $oldName)->first();

        if ($target) {
            $target->update(['hex_color' => $hex]);

            if ($old) {
                $old->variants()->delete();
                $old->images()->delete();
                $old->delete();
            }

            return;
        }

        if ($old) {
            $old->update([
                'name' => $newName,
                'hex_color' => $hex,
            ]);
        }
    }
}
