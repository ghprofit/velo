@extends('layouts.admin')

@section('title', 'Edit Product')

@section('content')
    <div class="mb-6">
        <a href="{{ route('admin.products.index') }}" class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Products
        </a>
    </div>

    <div class="max-w-3xl">
        {{-- Existing Images (separate from the main form to avoid nested forms) --}}
        @if($product->images && $product->images->count() > 0)
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h2 class="text-lg font-semibold text-gray-900">Current Images</h2>
                    <p class="text-xs text-gray-500 mt-1">The image marked as "PRIMARY" will be used as the main product image. Assign a color to an image so it shows when that color is selected on the product page.</p>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        @foreach($product->images as $image)
                            <div class="relative group">
                                <img src="{{ asset('storage/' . $image->image_path) }}" alt="{{ $product->name }}"
                                     class="h-32 w-full object-cover rounded-lg border-2 {{ $image->is_primary ? 'border-indigo-500' : 'border-gray-200' }}">

                                @if($image->is_primary)
                                    <div class="absolute top-2 left-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                                        PRIMARY
                                    </div>
                                @else
                                    <form action="{{ route('admin.products.image.set-primary', $image) }}" method="POST" class="absolute top-2 left-2">
                                        @csrf
                                        @method('PATCH')
                                        <button type="submit"
                                                class="bg-gray-800/75 text-white text-xs font-semibold px-2 py-1 rounded shadow-sm hover:bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                title="Set as primary">
                                            SET PRIMARY
                                        </button>
                                    </form>
                                @endif

                                <form action="{{ route('admin.products.image.delete', $image) }}" method="POST"
                                      class="absolute top-2 right-2"
                                      onsubmit="return confirm('Are you sure you want to delete this image?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit"
                                            class="bg-red-600 text-white rounded-full p-1 hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                    </button>
                                </form>

                                @if($product->colors->count() > 0)
                                    <form action="{{ route('admin.products.image.assign-color', $image) }}" method="POST" class="mt-2">
                                        @csrf
                                        @method('PATCH')
                                        <select name="product_color_id" onchange="this.form.submit()"
                                                class="w-full text-xs rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                                            <option value="">All colors</option>
                                            @foreach($product->colors as $color)
                                                <option value="{{ $color->id }}" {{ $image->product_color_id == $color->id ? 'selected' : '' }}>{{ $color->name }}</option>
                                            @endforeach
                                        </select>
                                    </form>
                                @endif
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
        @endif

        {{-- Colors --}}
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-lg font-semibold text-gray-900">Colors</h2>
                <p class="text-xs text-gray-500 mt-1">Add the colors this shoe comes in. Sizes & stock are tracked per color below.</p>
            </div>
            <div class="p-6 space-y-4">
                @if($product->colors->count() > 0)
                    <ul class="divide-y divide-gray-100 border border-gray-200 rounded-md">
                        @foreach($product->colors as $color)
                            <li class="flex items-center justify-between px-4 py-3">
                                <div class="flex items-center gap-3">
                                    <span class="w-5 h-5 rounded-full border border-gray-300" style="background-color: {{ $color->hex_color ?? '#e5e7eb' }}"></span>
                                    <span class="text-sm font-medium text-gray-900">{{ $color->name }}</span>
                                    <span class="text-xs text-gray-400">{{ $color->variants->count() }} {{ Str::plural('size', $color->variants->count()) }}</span>
                                </div>
                                <form action="{{ route('admin.products.colors.destroy', $color) }}" method="POST" onsubmit="return confirm('Delete this color and all its sizes?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="text-xs text-red-600 hover:text-red-800 font-medium">Remove</button>
                                </form>
                            </li>
                        @endforeach
                    </ul>
                @endif

                <form action="{{ route('admin.products.colors.store', $product) }}" method="POST" class="flex flex-wrap items-end gap-3">
                    @csrf
                    <div>
                        <label class="block text-xs font-medium text-gray-700">Color name</label>
                        <input type="text" name="name" required placeholder="e.g. White"
                               class="mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-700">Swatch</label>
                        <input type="color" name="hex_color" value="#111111"
                               class="mt-1 h-9 w-14 rounded-md border-gray-300 shadow-sm">
                    </div>
                    <button type="submit"
                            class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 transition">
                        Add Color
                    </button>
                </form>
                @error('name')
                    <p class="text-sm text-red-600">{{ $message }}</p>
                @enderror
            </div>
        </div>

        {{-- Sizes & Stock --}}
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-lg font-semibold text-gray-900">Sizes & Stock</h2>
                <p class="text-xs text-gray-500 mt-1">Track stock per size for each color. Sizes without a color apply to all colors.</p>
            </div>
            <div class="p-6 space-y-6">
                @php $sizeGroups = $product->colors->isNotEmpty() ? $product->colors : collect([null]); @endphp
                @foreach($sizeGroups as $color)
                    <div>
                        <h3 class="text-sm font-semibold text-gray-800 mb-2">{{ $color?->name ?? 'General (no color)' }}</h3>
                        @php $variants = $color ? $color->variants : $product->variants()->whereNull('product_color_id')->get(); @endphp
                        @if($variants->count() > 0)
                            <table class="w-full text-sm mb-3">
                                <tbody class="divide-y divide-gray-100">
                                    @foreach($variants as $variant)
                                        <tr>
                                            <td class="py-2 font-medium text-gray-700 w-24">EU {{ $variant->size }}</td>
                                            <td class="py-2">
                                                <form action="{{ route('admin.products.variants.update', $variant) }}" method="POST" class="flex items-center gap-2">
                                                    @csrf
                                                    @method('PATCH')
                                                    <input type="number" name="stock" value="{{ $variant->stock }}" min="0"
                                                           class="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm">
                                                    <button type="submit" class="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Save</button>
                                                </form>
                                            </td>
                                            <td class="py-2 text-right">
                                                <form action="{{ route('admin.products.variants.destroy', $variant) }}" method="POST" onsubmit="return confirm('Remove this size?')">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="text-xs text-red-600 hover:text-red-800 font-medium">Remove</button>
                                                </form>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        @endif
                        <form action="{{ route('admin.products.variants.store', $product) }}" method="POST" class="flex flex-wrap items-end gap-3">
                            @csrf
                            <input type="hidden" name="product_color_id" value="{{ $color?->id }}">
                            <div>
                                <label class="block text-xs font-medium text-gray-700">Size (EU)</label>
                                <input type="text" name="size" required placeholder="e.g. 42.5"
                                       class="mt-1 w-28 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-700">Stock</label>
                                <input type="number" name="stock" required min="0" value="0"
                                       class="mt-1 w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                            </div>
                            <button type="submit"
                                    class="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-900 transition">
                                Add Size
                            </button>
                        </form>
                    </div>
                @endforeach
            </div>
        </div>

        {{-- Main Product Update Form --}}
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
                <h1 class="text-lg font-semibold text-gray-900">Edit Product: {{ $product->name }}</h1>
            </div>

            <form action="{{ route('admin.products.update', $product) }}" method="POST" enctype="multipart/form-data" class="p-6 space-y-6">
                @csrf
                @method('PUT')

                {{-- Name --}}
                <div>
                    <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" name="name" id="name" value="{{ old('name', $product->name) }}"
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                           required>
                    @error('name')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                {{-- Category --}}
                <div>
                    <label for="category_id" class="block text-sm font-medium text-gray-700">Category</label>
                    <select name="category_id" id="category_id"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required>
                        <option value="">Select a category</option>
                        @foreach($categories as $category)
                            <option value="{{ $category->id }}" {{ old('category_id', $product->category_id) == $category->id ? 'selected' : '' }}>
                                {{ $category->name }}
                            </option>
                        @endforeach
                    </select>
                    @error('category_id')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                {{-- Description --}}
                <div>
                    <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" id="description" rows="5"
                              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">{{ old('description', $product->description) }}</textarea>
                    @error('description')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                {{-- Price and Sale Price --}}
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label for="price" class="block text-sm font-medium text-gray-700">Price ($)</label>
                        <input type="number" name="price" id="price" value="{{ old('price', $product->price) }}" step="0.01" min="0"
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                               required>
                        @error('price')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="sale_price" class="block text-sm font-medium text-gray-700">Sale Price ($)</label>
                        <input type="number" name="sale_price" id="sale_price" value="{{ old('sale_price', $product->sale_price) }}" step="0.01" min="0"
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                        @error('sale_price')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                {{-- Stock and SKU --}}
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label for="stock" class="block text-sm font-medium text-gray-700">Stock</label>
                        <input type="number" name="stock" id="stock" value="{{ old('stock', $product->stock) }}" min="0"
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                               required>
                        @error('stock')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="sku" class="block text-sm font-medium text-gray-700">SKU</label>
                        <input type="text" name="sku" id="sku" value="{{ old('sku', $product->sku) }}"
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                        @error('sku')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                {{-- Checkboxes --}}
                <div class="space-y-4">
                    <div class="flex items-center">
                        <input type="checkbox" name="is_digital" id="is_digital" value="1"
                               class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                               {{ old('is_digital', $product->is_digital) ? 'checked' : '' }}>
                        <label for="is_digital" class="ml-2 block text-sm text-gray-700">Is Digital Product</label>
                    </div>

                    <div class="flex items-center">
                        <input type="checkbox" name="featured" id="featured" value="1"
                               class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                               {{ old('featured', $product->featured) ? 'checked' : '' }}>
                        <label for="featured" class="ml-2 block text-sm text-gray-700">Featured</label>
                    </div>

                    <div class="flex items-center">
                        <input type="checkbox" name="active" id="active" value="1"
                               class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                               {{ old('active', $product->active) ? 'checked' : '' }}>
                        <label for="active" class="ml-2 block text-sm text-gray-700">Active</label>
                    </div>
                </div>

                {{-- Upload New Images --}}
                <div x-data="{
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
                    <label for="images" class="block text-sm font-medium text-gray-700">Add More Images</label>
                    <p class="text-xs text-gray-500 mb-2">You can upload up to 10 images total per product (max 5MB each).</p>
                    <input type="file" name="images[]" id="images" accept="image/*" multiple
                           @change="handleFiles($event)"
                           class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100">
                    @error('images')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                    @error('images.*')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                    
                    <!-- New Image Previews -->
                    <div x-show="previews.length > 0" class="mt-4">
                        <p class="text-xs font-medium text-gray-700 mb-2">New images to be uploaded:</p>
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                </div>

                {{-- Submit --}}
                <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    <a href="{{ route('admin.products.index') }}"
                       class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                        Cancel
                    </a>
                    <button type="submit"
                            class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                        Update Product
                    </button>
                </div>
            </form>
        </div>
    </div>
@endsection
