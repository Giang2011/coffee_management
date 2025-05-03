<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    //
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
