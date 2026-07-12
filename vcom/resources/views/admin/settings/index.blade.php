@extends('layouts.admin')

@section('title', 'Site Settings')

@section('content')
    <div class="max-w-4xl">
        <div class="mb-6 flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Site Settings</h1>
                <p class="mt-1 text-sm text-gray-600">Customize your website's appearance and content</p>
            </div>
            <a href="{{ route('home') }}" target="_blank"
               class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                Preview Live Site
            </a>
        </div>

        {{-- General Settings Form --}}
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <form action="{{ route('admin.settings.update') }}" method="POST" enctype="multipart/form-data" class="p-6 space-y-8">
                @csrf
                @method('PUT')

                {{-- General Settings --}}
                <div>
                    <h2 class="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
                    <div class="space-y-4">
                        <div>
                            <label for="site_name" class="block text-sm font-medium text-gray-700">Site Name</label>
                            <input type="text" name="site_name" id="site_name" value="{{ old('site_name', $settings['site_name']) }}"
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                   required>
                            @error('site_name')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>
                </div>

                {{-- Hero Section --}}
                <div class="pt-6 border-t border-gray-200">
                    <h2 class="text-lg font-semibold text-gray-900 mb-4">Hero Section</h2>
                    <div class="space-y-4">
                        <div>
                            <label for="hero_title" class="block text-sm font-medium text-gray-700">Hero Title</label>
                            <input type="text" name="hero_title" id="hero_title" value="{{ old('hero_title', $settings['hero_title']) }}"
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                   required>
                            @error('hero_title')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <div>
                            <label for="hero_subtitle" class="block text-sm font-medium text-gray-700">Hero Subtitle</label>
                            <textarea name="hero_subtitle" id="hero_subtitle" rows="2"
                                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">{{ old('hero_subtitle', $settings['hero_subtitle']) }}</textarea>
                            @error('hero_subtitle')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <div>
                            <label for="hero_image" class="block text-sm font-medium text-gray-700">Hero Background Image</label>
                            @if($settings['hero_image'])
                                <div class="mt-2 mb-3">
                                    <img src="{{ asset('storage/' . $settings['hero_image']) }}" alt="Hero Image" class="h-32 w-auto rounded-lg border border-gray-200">
                                    <p class="mt-1 text-xs text-gray-500">Current hero image</p>
                                </div>
                            @endif
                            <input type="file" name="hero_image" id="hero_image" accept="image/*"
                                   class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100">
                            <p class="mt-1 text-xs text-gray-500">Recommended size: 1920x600px (max 5MB)</p>
                            @error('hero_image')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>
                </div>

                {{-- Color Scheme --}}
                <div class="pt-6 border-t border-gray-200">
                    <h2 class="text-lg font-semibold text-gray-900 mb-4">Color Scheme</h2>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label for="primary_color" class="block text-sm font-medium text-gray-700">Primary Color</label>
                            <div class="mt-1 flex items-center space-x-3">
                                <input type="color" name="primary_color" id="primary_color" value="{{ old('primary_color', $settings['primary_color']) }}"
                                       class="h-10 w-20 rounded border border-gray-300 cursor-pointer">
                                <input type="text" value="{{ old('primary_color', $settings['primary_color']) }}"
                                       onchange="document.getElementById('primary_color').value = this.value"
                                       class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                       pattern="^#[0-9A-Fa-f]{6}$"
                                       placeholder="#4f46e5">
                            </div>
                            @error('primary_color')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <div>
                            <label for="secondary_color" class="block text-sm font-medium text-gray-700">Secondary Color</label>
                            <div class="mt-1 flex items-center space-x-3">
                                <input type="color" name="secondary_color" id="secondary_color" value="{{ old('secondary_color', $settings['secondary_color']) }}"
                                       class="h-10 w-20 rounded border border-gray-300 cursor-pointer">
                                <input type="text" value="{{ old('secondary_color', $settings['secondary_color']) }}"
                                       onchange="document.getElementById('secondary_color').value = this.value"
                                       class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                       pattern="^#[0-9A-Fa-f]{6}$"
                                       placeholder="#10b981">
                            </div>
                            @error('secondary_color')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>
                </div>

                {{-- Promotional Banner --}}
                <div class="pt-6 border-t border-gray-200">
                    <h2 class="text-lg font-semibold text-gray-900 mb-4">Promotional Banner</h2>
                    <div class="space-y-4">
                        <div class="flex items-center">
                            <input type="checkbox" name="show_banner" id="show_banner" value="1"
                                   class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                   {{ old('show_banner', $settings['show_banner']) == '1' ? 'checked' : '' }}>
                            <label for="show_banner" class="ml-2 block text-sm text-gray-700">Show promotional banner</label>
                        </div>

                        <div>
                            <label for="banner_text" class="block text-sm font-medium text-gray-700">Banner Text</label>
                            <input type="text" name="banner_text" id="banner_text" value="{{ old('banner_text', $settings['banner_text']) }}"
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                   placeholder="Free shipping on orders over {{ currency(50) }}!">
                            @error('banner_text')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <div>
                            <label for="tinymce_api_key" class="block text-sm font-medium text-gray-700">TinyMCE API Key</label>
                            <input type="text" name="tinymce_api_key" id="tinymce_api_key" value="{{ old('tinymce_api_key', $settings['tinymce_api_key']) }}"
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono text-xs"
                                   placeholder="your-api-key-here">
                            @error('tinymce_api_key')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                            <p class="mt-1 text-xs text-gray-500">
                                Get your free API key from <a href="https://www.tiny.cloud/auth/signup/" target="_blank" class="text-indigo-600 hover:text-indigo-800">TinyMCE</a>. 
                                Used for the newsletter rich text editor.
                            </p>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="currency" class="block text-sm font-medium text-gray-700">Currency Code *</label>
                                <select name="currency" id="currency"
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        onchange="updateCurrencySymbol()">
                                    <option value="USD" data-symbol="$" {{ old('currency', $settings['currency']) == 'USD' ? 'selected' : '' }}>USD - US Dollar</option>
                                    <option value="GHS" data-symbol="₵" {{ old('currency', $settings['currency']) == 'GHS' ? 'selected' : '' }}>GHS - Ghana Cedi</option>
                                    <option value="EUR" data-symbol="€" {{ old('currency', $settings['currency']) == 'EUR' ? 'selected' : '' }}>EUR - Euro</option>
                                    <option value="GBP" data-symbol="£" {{ old('currency', $settings['currency']) == 'GBP' ? 'selected' : '' }}>GBP - British Pound</option>
                                    <option value="NGN" data-symbol="₦" {{ old('currency', $settings['currency']) == 'NGN' ? 'selected' : '' }}>NGN - Nigerian Naira</option>
                                    <option value="ZAR" data-symbol="R" {{ old('currency', $settings['currency']) == 'ZAR' ? 'selected' : '' }}>ZAR - South African Rand</option>
                                    <option value="KES" data-symbol="KSh" {{ old('currency', $settings['currency']) == 'KES' ? 'selected' : '' }}>KES - Kenyan Shilling</option>
                                    <option value="CAD" data-symbol="C$" {{ old('currency', $settings['currency']) == 'CAD' ? 'selected' : '' }}>CAD - Canadian Dollar</option>
                                    <option value="AUD" data-symbol="A$" {{ old('currency', $settings['currency']) == 'AUD' ? 'selected' : '' }}>AUD - Australian Dollar</option>
                                </select>
                                @error('currency')
                                    <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                @enderror
                                <p class="mt-1 text-xs text-gray-500">
                                    Select the currency used for pricing throughout the site.
                                </p>
                            </div>

                            <div>
                                <label for="currency_symbol" class="block text-sm font-medium text-gray-700">Currency Symbol *</label>
                                <input type="text" name="currency_symbol" id="currency_symbol" value="{{ old('currency_symbol', $settings['currency_symbol']) }}"
                                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                       placeholder="₵" required maxlength="10">
                                @error('currency_symbol')
                                    <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                @enderror
                                <p class="mt-1 text-xs text-gray-500">
                                    Symbol displayed before prices (e.g., $, ₵, €).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Payment Methods --}}
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg mt-6">
                    <div class="p-6 text-gray-900">
                        <h3 class="text-lg font-semibold mb-4">Payment Methods</h3>
                        <p class="text-sm text-gray-600 mb-4">Enable or disable payment methods available at checkout. At least one payment method must be enabled.</p>
                        
                        @error('payment_methods')
                            <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                <p class="text-sm text-red-600">{{ $message }}</p>
                            </div>
                        @enderror

                        <div class="space-y-4">
                            <!-- Cash on Delivery -->
                            <div class="flex items-start">
                                <div class="flex items-center h-5">
                                    <input type="checkbox" name="payment_method_cod" id="payment_method_cod" value="1"
                                           {{ old('payment_method_cod', $settings['payment_method_cod']) == '1' ? 'checked' : '' }}
                                           class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                                </div>
                                <div class="ml-3">
                                    <label for="payment_method_cod" class="font-medium text-gray-700 cursor-pointer">
                                        Cash on Delivery (COD)
                                    </label>
                                    <p class="text-xs text-gray-500">Allow customers to pay when their order arrives at their doorstep.</p>
                                </div>
                            </div>

                            <!-- Paystack Payment -->
                            <div class="flex items-start">
                                <div class="flex items-center h-5">
                                    <input type="checkbox" name="payment_method_paystack" id="payment_method_paystack" value="1"
                                           {{ old('payment_method_paystack', $settings['payment_method_paystack']) == '1' ? 'checked' : '' }}
                                           class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                                </div>
                                <div class="ml-3">
                                    <label for="payment_method_paystack" class="font-medium text-gray-700 cursor-pointer">
                                        Paystack (Mobile Money, Bank Transfer & Cards)
                                    </label>
                                    <p class="text-xs text-gray-500">Accept payments via mobile money, bank transfer, or credit/debit cards through Paystack.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <script>
                function updateCurrencySymbol() {
                    const currencySelect = document.getElementById('currency');
                    const currencySymbolInput = document.getElementById('currency_symbol');
                    const selectedOption = currencySelect.options[currencySelect.selectedIndex];
                    const symbol = selectedOption.getAttribute('data-symbol');
                    if (symbol) {
                        currencySymbolInput.value = symbol;
                    }
                }
                </script>

                {{-- Submit Button --}}
                <div class="flex items-center justify-end pt-6 border-t border-gray-200">
                    <button type="submit"
                            class="inline-flex items-center px-6 py-3 bg-indigo-600 border border-transparent rounded-md font-semibold text-sm text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                        Save Settings
                    </button>
                </div>
            </form>
        </div>

        {{-- Hero Banners Management --}}
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Hero Banners (Slider)</h2>
            <p class="text-sm text-gray-600 mb-4">Upload multiple images to create a rotating banner slider on the homepage</p>
                    
                    {{-- Current Banners --}}
                    @if($heroBanners->count() > 0)
                        <div class="mb-6 space-y-4" x-data="{ expanded: null }">
                            <h3 class="text-sm font-medium text-gray-700 mb-3">Manage Banners ({{ $heroBanners->count() }})</h3>
                            
                            @foreach($heroBanners as $index => $banner)
                                <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                    {{-- Banner Preview Header --}}
                                    <div class="flex items-center p-4 cursor-pointer hover:bg-gray-50" 
                                         @click="expanded = expanded === {{ $index }} ? null : {{ $index }}">
                                        <img src="{{ asset('storage/' . $banner->image_path) }}" alt="Banner {{ $index + 1 }}" 
                                             class="h-16 w-28 object-cover rounded border border-gray-200">
                                        <div class="ml-4 flex-1">
                                            <h4 class="font-medium text-gray-900">Banner #{{ $index + 1 }} 
                                                <span class="text-xs px-2 py-1 rounded {{ $banner->active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800' }}">
                                                    {{ $banner->active ? 'Active' : 'Inactive' }}
                                                </span>
                                            </h4>
                                            <p class="text-sm text-gray-500 mt-1">
                                                {{ $banner->title ?: 'No title set' }} 
                                                @if($banner->button_text) • Button: {{ $banner->button_text }} @endif
                                            </p>
                                        </div>
                                        <svg class="w-5 h-5 text-gray-400 transition-transform" 
                                             :class="{ 'rotate-180': expanded === {{ $index }} }"
                                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </div>

                                    {{-- Edit Form --}}
                                    <div x-show="expanded === {{ $index }}" x-collapse class="border-t border-gray-200">
                                        <div class="p-6 bg-gray-50">
                                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {{-- Preview --}}
                                                <div>
                                                    <h5 class="text-sm font-medium text-gray-700 mb-3">Preview</h5>
                                                    <div class="relative aspect-video rounded-lg overflow-hidden">
                                                        <img src="{{ asset('storage/' . $banner->image_path) }}" alt="Banner Preview" 
                                                             class="w-full h-full object-cover">
                                                        <div class="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-6">
                                                            <div>
                                                                <h2 class="text-xl font-bold text-white">{{ $banner->title ?: $settings['hero_title'] }}</h2>
                                                                <p class="text-white/90 text-sm mt-1">{{ $banner->subtitle ?: $settings['hero_subtitle'] }}</p>
                                                                <span class="inline-block mt-3 bg-white text-red-600 font-semibold px-4 py-2 rounded text-xs">
                                                                    {{ $banner->button_text ?: 'SHOP NOW' }}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {{-- Edit Fields --}}
                                                <div>
                                                    <form action="{{ route('admin.settings.hero-banner.update', $banner) }}" method="POST">
                                                        @csrf
                                                        @method('PUT')
                                                        
                                                        <div class="space-y-4">
                                                            <div>
                                                                <label class="block text-sm font-medium text-gray-700">Title</label>
                                                                <input type="text" name="title" value="{{ $banner->title }}"
                                                                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                                       placeholder="Leave empty to use default">
                                                            </div>

                                                            <div>
                                                                <label class="block text-sm font-medium text-gray-700">Subtitle</label>
                                                                <textarea name="subtitle" rows="2"
                                                                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                                          placeholder="Leave empty to use default">{{ $banner->subtitle }}</textarea>
                                                            </div>

                                                            <div>
                                                                <label class="block text-sm font-medium text-gray-700">Button Text</label>
                                                                <input type="text" name="button_text" value="{{ $banner->button_text }}"
                                                                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                                       placeholder="SHOP NOW">
                                                            </div>

                                                            <div>
                                                                <label class="block text-sm font-medium text-gray-700">Button Link</label>
                                                                <input type="text" name="button_link" value="{{ $banner->button_link }}"
                                                                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                                       placeholder="/shop">
                                                            </div>

                                                            <div class="flex items-center">
                                                                <input type="checkbox" name="active" id="banner_active_{{ $banner->id }}" value="1"
                                                                       class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                       {{ $banner->active ? 'checked' : '' }}>
                                                                <label for="banner_active_{{ $banner->id }}" class="ml-2 block text-sm text-gray-700">Active</label>
                                                            </div>

                                                            <div class="flex items-center">
                                                                <input type="checkbox" name="show_text" id="banner_show_text_{{ $banner->id }}" value="1"
                                                                       class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                       {{ $banner->show_text ? 'checked' : '' }}>
                                                                <label for="banner_show_text_{{ $banner->id }}" class="ml-2 block text-sm text-gray-700">
                                                                    Show Text Overlay
                                                                    <span class="block text-xs text-gray-500">Uncheck if banner image already contains text</span>
                                                                </label>
                                                            </div>

                                                            <div class="flex items-center justify-between pt-4 border-t border-gray-200">
                                                                <button type="button"
                                                                        onclick="if(confirm('Are you sure you want to delete this banner?')) document.getElementById('delete-banner-{{ $banner->id }}').submit()"
                                                                        class="text-sm text-red-600 hover:text-red-700 font-medium">
                                                                    Delete Banner
                                                                </button>

                                                                <button type="submit"
                                                                        class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                                                    Save Changes
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </form>
                                                    <form id="delete-banner-{{ $banner->id }}" action="{{ route('admin.settings.hero-banner.delete', $banner) }}" method="POST" class="hidden">
                                                        @csrf
                                                        @method('DELETE')
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @else
                        <div class="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                            <p class="text-sm text-gray-600">No hero banners uploaded yet. Upload images below to create a slider.</p>
                        </div>
                    @endif

                    {{-- Upload New Banners --}}
                    <form action="{{ route('admin.settings.hero-banners.upload') }}" method="POST" enctype="multipart/form-data"
                          x-data="{
                              previews: [],
                              handleFiles(event) {
                                  const files = event.target.files;
                                  this.previews = [];
                                  for (let i = 0; i < files.length; i++) {
                                      const reader = new FileReader();
                                      reader.onload = (e) => {
                                          this.previews.push({
                                              url: e.target.result,
                                              name: files[i].name
                                          });
                                      };
                                      reader.readAsDataURL(files[i]);
                                  }
                              }
                          }">
                        @csrf
                        <div>
                            <label for="hero_banners" class="block text-sm font-medium text-gray-700">Upload Hero Banners</label>
                            <input type="file" name="hero_banners[]" id="hero_banners" accept="image/*" multiple
                                   @change="handleFiles($event)"
                                   class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100">
                            <p class="mt-1 text-xs text-gray-500">Select up to 10 images. Recommended size: 1920x600px (max 5MB each)</p>
                            @error('hero_banners')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                            @error('hero_banners.*')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Image Previews -->
                        <div x-show="previews.length > 0" class="mt-4">
                            <p class="text-xs font-medium text-gray-700 mb-2">Selected images to be uploaded:</p>
                            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                <template x-for="(preview, index) in previews" :key="index">
                                    <div class="relative group">
                                        <img :src="preview.url" :alt="preview.name"
                                             class="h-32 w-full object-cover rounded-lg border-2 border-green-200">
                                        <div class="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded truncate">
                                            <span x-text="preview.name"></span>
                                        </div>
                                        <div class="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                                            NEW
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div>

                        <button type="submit"
                                class="mt-3 inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                            Upload Banners
                        </button>
                    </form>
                </div>
        </div>
    </div>

    <script>
        // Sync color picker with text input
        document.getElementById('primary_color').addEventListener('input', function() {
            this.nextElementSibling.value = this.value;
        });
        document.getElementById('secondary_color').addEventListener('input', function() {
            this.nextElementSibling.value = this.value;
        });
    </script>
@endsection
