<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    //
    protected $fillable = [
        'name',
        'description',
        'price',
        'stock_quantity',
        'category_id',
        'image_path',
    ];
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    public function cart_items()
    {
        return $this->hasMany(CartItem::class);
    }
    public function order_details()
    {
        return $this->hasMany(OrderDetails::class);
    }
}
