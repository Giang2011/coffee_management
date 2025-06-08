<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Voucher;

class ProductController extends Controller
{
    //
    public function index()
    {
        $products = Product::with('category')->get(); // Lấy tất cả sản phẩm kèm danh mục
        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::with('category')->find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($product);
    }

    public function search($name)
    {
        $products = Product::with('category')
            ->where('name', 'like', '%' . $name . '%')
            ->get();

        if ($products->isEmpty()) {
            return response()->json(['message' => 'No products found'], 404);
        }

        return response()->json($products);
    }
    
    public function listCategories()
{
    $categories = Category::all();

    if ($categories->isEmpty()) {
        return response()->json(['message' => 'No categories found'], 404);
    }

    return response()->json($categories);
}

    public function getVoucher(Request $request)
    {
        // Giả sử bạn có một model Voucher để lấy mã giảm giá
        $vouchers = Voucher::all();

        if ($vouchers->isEmpty()) {
            return response()->json(['message' => 'No vouchers available'], 404);
        }

        return response()->json($vouchers);
    }
}
