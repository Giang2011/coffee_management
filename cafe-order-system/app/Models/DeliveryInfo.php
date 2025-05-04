<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryInfo extends Model
{
    //
    protected $fillable = [
        'order_id',
        'phone_number',
        'recipient_name',
        'address',
        'note',
    ];
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
