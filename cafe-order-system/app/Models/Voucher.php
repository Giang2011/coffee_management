<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    //
    protected $fillable = [
        'code',
        'discount_percent',
        'start_date',
        'end_date',
        'max_usage',
    ];
    public function users()
    {
        return $this->belongsToMany(User::class, 'voucher_usages', 'voucher_id', 'user_id');
    }
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
