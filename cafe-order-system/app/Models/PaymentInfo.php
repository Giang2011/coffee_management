<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentInfo extends Model
{
    //
    protected $fillable = [
        'order_id',
        'payment_method_id',
        'amount',
        'payment_date',
    ];
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
    public function payment_method()
    {
        return $this->belongsTo(PaymentMethod::class);
    }
}
