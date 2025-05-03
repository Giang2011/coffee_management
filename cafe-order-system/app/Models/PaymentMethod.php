<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    //
    public function payment_infos()
    {
        return $this->hasMany(PaymentInfo::class);
    }
}
