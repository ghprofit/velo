<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate([
            'email' => 'admin@wearstryd.com',
        ], [
            'name' => 'Admin',
            'password' => Hash::make('WearStryd12@'),
            'is_admin' => true,
        ]);

        $admin->forceFill([
            'name' => $admin->name ?: 'Admin',
            'is_admin' => true,
            'email_verified_at' => $admin->email_verified_at ?? now(),
        ])->save();
    }
}
