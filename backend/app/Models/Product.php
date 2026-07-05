<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'pack_size',
        'mrp',
        'selling_price',
        'image',
        'sort_order',
        'status',
    ];

    /**
     * Get product's category.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Scope active products.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Accessor for calculated discount percentage.
     */
    public function getDiscountPercentageAttribute(): int
    {
        if ($this->mrp <= 0) {
            return 0;
        }
        $discount = (($this->mrp - $this->selling_price) / $this->mrp) * 100;
        return (int) round($discount);
    }
}
