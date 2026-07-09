<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // Insert default settings
        DB::table('settings')->insert([
            ['key' => 'site_name', 'value' => 'STRYD', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'hero_title', 'value' => 'Step Into Style', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'hero_subtitle', 'value' => 'New season sneakers for every stride', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'hero_image', 'value' => null, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'primary_color', 'value' => '#111111', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'secondary_color', 'value' => '#10b981', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'banner_text', 'value' => 'Free shipping on orders over $50!', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'show_banner', 'value' => '1', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
