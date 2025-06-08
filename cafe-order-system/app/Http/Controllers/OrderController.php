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
use App\Models\VoucherUsage;    

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

    // Lấy địa chỉ mặc định (kể cả khi null)
    $defaultAddress = $request->input('address') ?? $user->address;

    // lấy số điện thoại mặc định (kể cả khi null)
    $defaultPhoneNumber = $request->input('phone_number') ?? $user->phone_number;

    // Lấy các phương thức thanh toán
    $paymentMethods = PaymentMethod::all();

    $voucher = $request->input('voucher');

    $totalCost = $request->input('total_cost');

    return response()->json([
        'cart_items' => $cartItems,
        'default_address' => $defaultAddress,
        'payment_methods' => $paymentMethods,
        'total_cost' => $totalCost,
        'default_phone_number' => $defaultPhoneNumber, // Trả về số điện thoại mặc định
        'voucher' => $voucher,
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
            'voucher' => 'nullable|string|max:255',
            'total_cost' => 'required|numeric|min:0',
        ]);

        // Lấy giỏ hàng
        $cartItems = CartItem::with('product')->where('user_id', $user->id)->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        // Tạo đơn hàng
        $order = Order::create([
            'user_id' => $user->id,
            'status_id' => 1, // Pending
            'order_date' => now(),
            'voucher_id' => $validated['voucher_id'] ?? null, // Lưu voucher nếu có
        ]);

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
            'amount' => $validated['total_cost'],
            'payment_date' => now(),
        ]);

        // Xóa giỏ hàng
        CartItem::where('user_id', $user->id)->delete();

        return response()->json([
            'message' => 'Order placed successfully',
            'order' => $order,
            'total_cost' => $validated['total_cost'],
            'voucher' => $validated['voucher'] ?? null,
        ]);
    }

    public function listOrders(Request $request)
{
    $user = $request->user();
    $orders = Order::with(['status', 'order_details', 'order_details.product']) 
        ->where('user_id', $user->id)
        ->orderBy('order_date', 'desc')
        ->get();

    $result = $orders->map(function ($order) {
        $total = $order->order_details->sum(function ($item) { 
            return $item->price * $item->quantity;
        });
        return [
            'id' => $order->id,
            'order_date' => $order->order_date,
            'status' => $order->status->name,
            'total' => $total,
        ];
    });

    return response()->json($result);
}

    public function getOrderDetails(Request $request, $id)
{
    $user = $request->user();
    $order = Order::with([
        'status',
        'order_details.product', 
        'delivery_info',
        'payment_info.payment_method',
        'voucher'
    ])
    ->where('user_id', $user->id)
    ->find($id);

    if (!$order) {
        return response()->json(['message' => 'Order not found'], 404);
    }

    $total = $order->order_details->sum(function ($item) { 
        return $item->price * $item->quantity;
    });

    return response()->json([
        'id' => $order->id,
        'order_date' => $order->order_date,
        'status' => $order->status->name,
        'total' => $total,
        'discount' => $order->voucher ? $order->voucher->discount_percent : 0,
        'final_total' => $order->payment_info->amount ?? $total,
        'payment_method' => $order->payment_info->payment_method->name ?? null,
        'products' => $order->order_details->map(function ($item) { 
            return [
                'name' => $item->product->name,
                'quantity' => $item->quantity,
                'price' => $item->price,
            ];
        }),
        'delivery_info' => $order->delivery_info,
        'payment_info' => $order->payment_info,
        'voucher' => $order->voucher,
    ]);
}


    
    public function cancelOrder(Request $request, $id)
{
    $user = $request->user();
    $order = Order::with('status')
        ->where('user_id', $user->id)
        ->find($id);

    if (!$order) {
        return response()->json(['message' => 'Order not found'], 404);
    }

    if ($order->status->name !== 'Pending') {
        return response()->json(['message' => 'Only pending orders can be cancelled'], 400);
    }

    $cancelStatus = \App\Models\Status::where('name', 'Cancel')->first();
    if (!$cancelStatus) {
        return response()->json(['message' => 'Cancel status not found'], 500);
    }

    $order->status_id = $cancelStatus->id;
    $order->save();

    $order->load([
        'status',
        'order_details.product', 
        'delivery_info',
        'payment_info',
        'voucher'
    ]);

    $total = $order->order_details->sum(function ($item) { 
        return $item->price * $item->quantity;
    });

    return response()->json([
        'id' => $order->id,
        'order_date' => $order->order_date,
        'status' => $order->status->name,
        'total' => $total,
        'discount' => $order->voucher ? $order->voucher->discount_percent : 0,
        'final_total' => $order->payment_info->amount ?? $total,
        'products' => $order->order_details->map(function ($item) { 
            return [
                'name' => $item->product->name,
                'quantity' => $item->quantity,
                'price' => $item->price,
            ];
        }),
        'delivery_info' => $order->delivery_info,
        'payment_info' => $order->payment_info,
        'voucher' => $order->voucher,
    ]);
}
}
