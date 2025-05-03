<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;
    // filepath: c:\Users\ADMIN\Downloads\cafe-order-system\app\Models\User.php
protected $fillable = [
    'email',
    'password',
    'full_name',
    'phone_number',
    'address',
    'sex',
    'birth_date',
    'security_question',
    'answer',
];
    protected $table = 'users';
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
    public function cart_items()
    {
        return $this->hasMany(CartItem::class);
    }
    public function vouchers(){
        return $this->belongsToMany(Voucher::class, 'voucher_usages', 'user_id', 'voucher_id');
    }
    public function payment_infos()
    {
        return $this->hasMany(PaymentInfo::class, Order::class, 'user_id', 'order_id');
    }
    public function delivery_infos()
    {
        return $this->hasMany(DeliveryInfo::class, Order::class, 'user_id', 'order_id');
    }
}
