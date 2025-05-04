<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    //
    protected $fillable = [
        'user_id',
        'status_id',
        'voucher_id',
        'order_date',
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function order_details()
    {
        return $this->hasMany(OrderDetails::class);
    }
    public function delivery_info()
    {
        return $this->hasOne(DeliveryInfo::class);
    }
    public function payment_info()
    {
        return $this->hasOne(PaymentInfo::class);
    }
    public function status()
    {
        return $this->belongsTo(Status::class);
    }
    public function voucher()
    {
        return $this->belongsTo(Voucher::class);
    }
}
