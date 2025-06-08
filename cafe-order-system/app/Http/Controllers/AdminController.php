<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Category;
use App\Models\Voucher;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class AdminController extends Controller
{
    //
    public function listProducts()
    {
        $products = Product::with('category')->get();
        return response()->json($products);
    }

    
    public function createProduct(Request $request)
    {
        // Log::info('Request received', $request->all());
        // //return response()->json(['message' => 'Debugging createProduct']);

        // Log::info('Request data:', $request->all());
        // if ($request->hasFile('image')) {
        //     $file = $request->file('image');
        //     Log::info('File data:', [
        //         'original_name' => $file->getClientOriginalName(),
        //         'mime_type' => $file->getMimeType(),
        //         'size' => $file->getSize(),
        //     ]);
        // }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Validate ảnh
        ]);

        // Xử lý upload ảnh
        $imagePath = null;
        if ($request->hasFile('image')) {
            // Tạo tên file với timestamp để tránh trùng lặp
            $fileName = time() . '_' . $request->file('image')->getClientOriginalName();
            $imagePath = $request->file('image')->storeAs('products', $fileName, 'public'); // Lưu ảnh vào thư mục 'storage/app/public/products'
        }

        // Tạo sản phẩm
        $product = Product::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'stock_quantity' => $validated['stock_quantity'] ?? null,
            'category_id' => $validated['category_id'],
            'image_path' => $imagePath, // Lưu đường dẫn ảnh vào cơ sở dữ liệu
        ]);

        return response()->json(['message' => 'Product created successfully', 'product' => $product]);
    }

    
    public function updateProduct(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'nullable|integer|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Validate ảnh
        ]);
        // Log::info('Validated data:', $validated);

        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        // Xử lý upload ảnh nếu có
        if ($request->hasFile('image')) {
            // Xóa ảnh cũ nếu tồn tại
            if ($product->image_path && Storage::disk('public')->exists($product->image_path)) {
                Storage::disk('public')->delete($product->image_path);
            }

            // Tạo tên file mới với timestamp để tránh trùng lặp
            $fileName = time() . '_' . $request->file('image')->getClientOriginalName();
            $imagePath = $request->file('image')->storeAs('products', $fileName, 'public'); // Lưu ảnh mới
            $validated['image_path'] = $imagePath; // Cập nhật đường dẫn ảnh mới
        }

        // Cập nhật thông tin sản phẩm
        $product->update($validated);

        return response()->json(['message' => 'Product updated successfully', 'product' => $product]);
    }

    public function deleteProduct($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        // Xóa file ảnh nếu có
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }

    public function listCategories()
    {
        $categories = Category::all();
        return response()->json($categories);
    }

    public function createCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $category = Category::create($validated);

        return response()->json(['message' => 'Category created successfully', 'category' => $category]);
    }

    public function updateCategory(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
        ]);

        $category = Category::find($id);

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $category->update($validated);

        return response()->json(['message' => 'Category updated successfully', 'category' => $category]);
    }

    public function deleteCategory($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        // Kiểm tra nếu danh mục có sản phẩm liên quan
        if ($category->products()->exists()) {
            return response()->json(['message' => 'Cannot delete category with associated products'], 400);
        }

        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }

    public function listVouchers()
    {
        $vouchers = Voucher::all();
        return response()->json($vouchers);
    }

    
    public function createVoucher(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:vouchers,code',
            'discount_percent' => 'required|numeric|min:0|max:100',
            'start_date' => 'required|date', // Ngày bắt đầu
            'end_date' => 'required|date|after_or_equal:start_date', // Ngày kết thúc
            'max_usage' => 'nullable|integer|min:1', // Số lần sử dụng tối đa
        ]);

        $voucher = Voucher::create($validated);

        return response()->json(['message' => 'Voucher created successfully', 'voucher' => $voucher]);
    }

    public function updateVoucher(Request $request, $id)
    {
        $validated = $request->validate([
            'code' => 'nullable|string|unique:vouchers,code,' . $id,
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'start_date' => 'nullable|date', // Ngày bắt đầu
            'end_date' => 'nullable|date|after_or_equal:start_date', // Ngày kết thúc
            'max_usage' => 'nullable|integer|min:1', // Số lần sử dụng tối đa
        ]);

        $voucher = Voucher::find($id);

        if (!$voucher) {
            return response()->json(['message' => 'Voucher not found'], 404);
        }

        $voucher->update($validated);

        return response()->json(['message' => 'Voucher updated successfully', 'voucher' => $voucher]);
    }

    public function deleteVoucher($id)
    {
        $voucher = Voucher::find($id);

        if (!$voucher) {
            return response()->json(['message' => 'Voucher not found'], 404);
        }

        // Kiểm tra nếu voucher đã được sử dụng
        if ($voucher->orders()->exists()) {
            return response()->json(['message' => 'Cannot delete voucher that has been used'], 400);
        }

        $voucher->delete();

        return response()->json(['message' => 'Voucher deleted successfully']);
    }

    public function listOrders()
    {
        $orders = Order::with(['user', 'order_details.product', 'voucher'])->get();

        // Tính tổng giá tiền cho từng đơn hàng (bao gồm giảm giá từ voucher nếu có)
        $orders->each(function ($order) {
            // Tính tổng giá tiền gốc từ order_details
            $totalCost = $order->order_details->sum(function ($detail) {
                return $detail->price * $detail->quantity;
            });

            // Áp dụng giảm giá từ voucher (nếu có)
            $discount = 0;
            if ($order->voucher) {
                $discount = $totalCost * ($order->voucher->discount_percent / 100);
            }

            // Lưu tổng giá tiền sau khi áp dụng giảm giá
            $order->total_cost = $totalCost - $discount;
            $order->discount = $discount; // Thêm thông tin giảm giá vào response
        });

        return response()->json($orders);
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status_id' => 'required|exists:statuses,id',
        ]);

        $order = Order::find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $order->update(['status_id' => $validated['status_id']]);

        return response()->json(['message' => 'Order status updated successfully', 'order' => $order]);
    }

    public function listUsers()
    {
        $users = User::where('role', 'user')->get();
        return response()->json($users);
    }

    public function getUserDetails($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user);
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
}
