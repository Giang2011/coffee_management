<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CartItem;
use App\Models\PaymentMethod;
use App\Models\DeliveryInfo;
use App\Models\Order;
use App\Models\OrderDetails;
use App\Models\PaymentInfo;
use App\Models\Voucher;

class OrderController extends Controller
{
    //
    public function checkout(Request $request)
    {
        $user = $request->user();

        // Lấy thông tin giỏ hàng
        $cartItems = CartItem::with('product')->where('user_id', $user->id)->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        // Lấy các phương thức thanh toán
        $paymentMethods = PaymentMethod::all();

        // Lấy địa chỉ mặc định (nếu có)
        $defaultAddress = DeliveryInfo::where('user_id', $user->id)->latest()->first();

        return response()->json([
            'cart_items' => $cartItems,
            'payment_methods' => $paymentMethods,
            'default_address' => $defaultAddress,
        ]);
    }
    public function placeOrder(Request $request)
    {
        $user = $request->user();

        // Validate thông tin
        $validated = $request->validate([
            'payment_method_id' => 'required|exists:payment_methods,id',
            'delivery_info.recipient_name' => 'required|string|max:255',
            'delivery_info.phone_number' => 'required|string|max:15',
            'delivery_info.address' => 'required|string|max:255',
            'voucher_code' => 'nullable|string',
        ]);

        // Lấy giỏ hàng
        $cartItems = CartItem::with('product')->where('user_id', $user->id)->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        // Tính tổng tiền
        $totalCost = $cartItems->sum(function ($item) {
            return $item->product->price * $item->quantity;
        });

        // Áp dụng voucher (nếu có)
        $voucher = null;
        if ($request->has('voucher_code')) {
            $voucher = Voucher::where('code', $request->voucher_code)->first();

            if ($voucher) {
                $discount = $totalCost * ($voucher->discount_percent / 100);
                $totalCost -= $discount;
            }
        }

        // Tạo đơn hàng
        $order = Order::create([
            'user_id' => $user->id,
            'total_cost' => $totalCost,
            'voucher_id' => $voucher ? $voucher->id : null,
            'status_id' => 1, // Pending
            'order_date' => now(),
        ]);

        // Tạo chi tiết đơn hàng
        foreach ($cartItems as $item) {
            OrderDetails::create([
                'order_id' => $order->id,
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
                'price' => $item->product->price,
            ]);
        }

        // Tạo thông tin giao hàng
        DeliveryInfo::create([
            'order_id' => $order->id,
            'recipient_name' => $validated['delivery_info']['recipient_name'],
            'phone_number' => $validated['delivery_info']['phone_number'],
            'address' => $validated['delivery_info']['address'],
        ]);

        // Tạo thông tin thanh toán
        PaymentInfo::create([
            'order_id' => $order->id,
            'payment_method_id' => $validated['payment_method_id'],
            'amount' => $totalCost,
            'payment_date' => now(),
        ]);

        // Xóa giỏ hàng
        CartItem::where('user_id', $user->id)->delete();

        return response()->json(['message' => 'Order placed successfully', 'order' => $order]);
    }
}
