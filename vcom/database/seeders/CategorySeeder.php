<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Men', 'description' => 'Sneakers and footwear for men'],
            ['name' => 'Women', 'description' => 'Sneakers and footwear for women'],
            ['name' => 'Kids', 'description' => 'Sneakers and footwear for kids'],
            ['name' => 'Sports', 'description' => 'Performance running and training shoes'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
