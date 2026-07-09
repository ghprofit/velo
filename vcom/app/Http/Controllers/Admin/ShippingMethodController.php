<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShippingMethod;
use Illuminate\Http\Request;

class ShippingMethodController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $shippingMethods = ShippingMethod::withCount('products')->get();
        return view('admin.shipping.index', compact('shippingMethods'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('admin.shipping.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'cost' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['is_active'] = $request->has('is_active');

        ShippingMethod::create($validated);

        return redirect()->route('admin.shipping.index')
            ->with('success', 'Shipping method created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(ShippingMethod $shipping)
    {
        $shipping->load('products');
        return view('admin.shipping.show', compact('shipping'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ShippingMethod $shipping)
    {
        return view('admin.shipping.edit', compact('shipping'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ShippingMethod $shipping)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'cost' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['is_active'] = $request->has('is_active');

        $shipping->update($validated);

        return redirect()->route('admin.shipping.index')
            ->with('success', 'Shipping method updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ShippingMethod $shipping)
    {
        // Check if any products are using this shipping method
        if ($shipping->products()->count() > 0) {
            return redirect()->route('admin.shipping.index')
                ->with('error', 'Cannot delete shipping method that is assigned to products.');
        }

        $shipping->delete();

        return redirect()->route('admin.shipping.index')
            ->with('success', 'Shipping method deleted successfully.');
    }
}
