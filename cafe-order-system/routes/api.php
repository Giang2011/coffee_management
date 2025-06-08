<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\AdminController;


// Route::middleware('auth:sanctum')->get('/test', [UserController::class, 'test']);
Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);
Route::get('/products', [ProductController::class, 'index']); // Lấy danh sách sản phẩm
Route::get('/products/{id}', [ProductController::class, 'show']); // Lấy chi tiết sản phẩm
Route::get('/categories', [ProductController::class, 'listCategories']); // Lấy danh sách danh mục sản phẩm
Route::get('/products/search/{name}', [ProductController::class, 'search']); // Tìm kiếm sản phẩm theo tên
Route::post('/recover-account', [UserController::class, 'recoverAccount']); // Khôi phục tài khoản qua câu hỏi bảo mật
Route::post('/recover-account2', [UserController::class, 'recover']); // Khôi phục tài khoản qua câu hỏi bảo mật
Route::post('/reset-password', [UserController::class, 'resetPassword']); // Đặt lại mật khẩu qua email

Route::middleware(['auth:sanctum','role:user'])->group(function () { // route của user
    Route::get('/user', [UserController::class, 'getUser']); // This route is protected by the auth:sanctum middleware
    Route::put('/user', [UserController::class, 'updateUser']); // This route is protected by the auth:sanctum middleware
    Route::post('/logout', [UserController::class, 'logout']); // This route is protected by the auth:sanctum middleware

    Route::get('/cart', [CartController::class, 'index']); // Xem giỏ hàng
    Route::post('/cart', [CartController::class, 'store']); // Thêm sản phẩm vào giỏ hàng
    Route::put('/cart/{id}', [CartController::class, 'update']); // Cập nhật số lượng sản phẩm
    Route::delete('/cart/{id}', [CartController::class, 'destroy']); // Xóa sản phẩm khỏi giỏ hàng
    Route::post('/checkout', [OrderController::class, 'checkout']); // Bước 1: Hiển thị thông tin giỏ hàng
    Route::post('/order', [OrderController::class, 'placeOrder']); // Bước 2: Xử lý đặt hàng
    Route::get('/orders', [OrderController::class, 'listOrders']); // Danh sách đơn hàng của người dùng
    Route::put('/orders/{id}/cancel', [OrderController::class, 'cancelOrder']); // Hủy đơn hàng
    Route::get('/orders/{id}', [OrderController::class, 'getOrderDetails']); // Chi tiết đơn hàng của người dùng
});

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () { // route của admin
    // Quản lý sản phẩm
    Route::get('/admin/products', [AdminController::class, 'listProducts']); // Danh sách sản phẩm
    Route::post('/admin/products/create', [AdminController::class, 'createProduct']); // Thêm sản phẩm
    Route::put('/admin/products/{id}/edit', [AdminController::class, 'updateProduct']); // Sửa sản phẩm
    Route::delete('/admin/products/{id}', [AdminController::class, 'deleteProduct']); // Xóa sản phẩm

    // Quản lý danh mục
    Route::get('/admin/categories', [AdminController::class, 'listCategories']); // Danh sách danh mục
    Route::post('/admin/categories/create', [AdminController::class, 'createCategory']); // Thêm danh mục
    Route::put('/admin/categories/{id}/edit', [AdminController::class, 'updateCategory']); // Sửa danh mục
    Route::delete('/admin/categories/{id}', [AdminController::class, 'deleteCategory']); // Xóa danh mục

    // Quản lý mã giảm giá
    Route::get('/admin/vouchers', [AdminController::class, 'listVouchers']); // Danh sách mã giảm giá
    Route::post('/admin/vouchers/create', [AdminController::class, 'createVoucher']); // Thêm mã giảm giá
    Route::put('/admin/vouchers/{id}/edit', [AdminController::class, 'updateVoucher']); // Sửa mã giảm giá

    // Quản lý đơn hàng
    Route::get('/admin/orders', [AdminController::class, 'listOrders']); // Danh sách đơn hàng
    Route::get('/admin/orders/{id}', [AdminController::class, 'getOrderDetails']); // Chi tiết đơn hàng
    Route::put('/admin/orders/{id}/status', [AdminController::class, 'updateOrderStatus']); // Cập nhật trạng thái đơn hàng

    // Quản lý người dùng
    Route::get('/admin/users', [AdminController::class, 'listUsers']); // Danh sách người dùng
    Route::get('/admin/users/{id}', [AdminController::class, 'getUserDetails']); // Chi tiết người dùng

    
});
