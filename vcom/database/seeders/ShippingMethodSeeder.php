<?php

namespace Database\Seeders;

use App\Models\ShippingMethod;
use Illuminate\Database\Seeder;

class ShippingMethodSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            ['name' => 'Standard Delivery', 'description' => '3-5 business days', 'cost' => 5.00, 'is_active' => true],
            ['name' => 'Express Delivery', 'description' => '1-2 business days', 'cost' => 12.00, 'is_active' => true],
            ['name' => 'Store Pickup', 'description' => 'Pick up your order at our store', 'cost' => 0.00, 'is_active' => true],
        ];

        foreach ($methods as $method) {
            ShippingMethod::create($method);
        }
    }
}
