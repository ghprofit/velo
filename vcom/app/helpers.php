<?php

use App\Models\Setting;

if (!function_exists('currency')) {
    /**
     * Format a price with the site's currency symbol
     *
     * @param float|int $amount
     * @param bool $showCode
     * @return string
     */
    function currency($amount, $showCode = false)
    {
        $symbol = Setting::get('currency_symbol', '₵');
        $code = Setting::get('currency', 'GHS');
        $formatted = number_format($amount, 2);
        
        if ($showCode) {
            return $symbol . $formatted . ' ' . $code;
        }
        
        return $symbol . $formatted;
    }
}

if (!function_exists('currencySymbol')) {
    /**
     * Get the site's currency symbol
     *
     * @return string
     */
    function currencySymbol()
    {
        return Setting::get('currency_symbol', '₵');
    }
}

if (!function_exists('currencyCode')) {
    /**
     * Get the site's currency code
     *
     * @return string
     */
    function currencyCode()
    {
        return Setting::get('currency', 'GHS');
    }
}
