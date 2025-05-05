# Hệ Thống Quản Lý Đặt Hàng Cafe - API Routes


## **1. Route Công Khai (Public Routes)**

### Đăng ký tài khoản
- **Phương thức**: `POST`
- **Endpoint**: `/register`
- **Mô tả**: Đăng ký tài khoản mới.
- **Đầu vào**:
  ```json
  {
    "email": "string (bắt buộc, unique)",
    "password": "string (bắt buộc, tối thiểu 6 ký tự)",
    "full_name": "string (bắt buộc)",
    "phone_number": "string (bắt buộc)"
  }
  Đầu ra
  {
  "message": "User registered successfully",
  "user": {
    "id": "integer",
    "email": "string",
    "full_name": "string",
    "phone_number": "string"
  }
}

### Đăng nhập
- **Phương thức**: `POST`
- **Endpoint**: `/login`
- **Mô tả**: Đăng nhập và nhận token xác thực.
Đầu vào
{
  "email": "string (bắt buộc)",
  "password": "string (bắt buộc)"
}
Đầu ra
{
  "message": "Login successful",
  "token": "string (token xác thực)",
  "user": {
    "id": "integer",
    "email": "string",
    "full_name": "string"
  }
}

### Lấy danh sách sản phẩm
- **Phương thức**: `GET`
- **Endpoint**: `/products`
- **Mô tả**: Lấy danh sách tất cả sản phẩm.
Đầu ra
[
  {
    "id": "integer",
    "name": "string",
    "description": "string",
    "price": "float",
    "stock_quantity": "integer",
    "category": {
      "id": "integer",
      "name": "string"
    }
  }
]

### Lấy chi tiết sản phẩm
- **Phương thức**: `GET`
- **Endpoint**: `/products/{id}`
- **Mô tả**: Lấy thông tin chi tiết của một sản phẩm cụ thể.
Đầu vào: {id} là ID của sản phẩm.
Đầu ra
{
  "id": "integer",
  "name": "string",
  "description": "string",
  "price": "float",
  "stock_quantity": "integer",
  "category": {
    "id": "integer",
    "name": "string"
  }
}
---

## **2. Route Người Dùng (User Routes)**

### Middleware: `auth:sanctum`, `role:user`

### Lấy thông tin người dùng
- **Phương thức**: `GET`
- **Endpoint**: `/user`
- **Mô tả**: Lấy thông tin tài khoản người dùng hiện tại.
Đầu vào: Token xác thực trong header.
Đầu ra
{
  "id": "integer",
  "email": "string",
  "full_name": "string",
  "phone_number": "string"
}

### Cập nhật thông tin người dùng
- **Phương thức**: `PUT`
- **Endpoint**: `/user`
- **Mô tả**: Cập nhật thông tin tài khoản người dùng.
Đầu vào
{
  "full_name": "string (tùy chọn)",
  "password": "string (tùy chọn, tối thiểu 6 ký tự)",
  "phone_number": "string (tùy chọn)",
  "sex": "string (tùy chọn, giá trị: Male, Female, Other)",
  "birth_date": "date (tùy chọn)",
  "address": "string (tùy chọn)"
}

Đầu ra
{
  "message": "User updated successfully",
  "user": {
    "id": "integer",
    "email": "string",
    "full_name": "string",
    "phone_number": "string"
  }
}

### Đăng xuất
- **Phương thức**: `POST`
- **Endpoint**: `/logout`
- **Mô tả**: Đăng xuất và xóa token xác thực.
Đầu vào: Token xác thực trong header.
Đầu ra
{
  "message": "Logged out successfully"
}

### Quản lý giỏ hàng
- **Xem giỏ hàng**
  - **Phương thức**: `GET`
  - **Endpoint**: `/cart`
  - **Mô tả**: Lấy danh sách sản phẩm trong giỏ hàng.
  Đầu vào: Token xác thực trong header.
  Đầu ra
  [
  {
    "id": "integer",
    "product": {
      "id": "integer",
      "name": "string",
      "price": "float"
    },
    "quantity": "integer"
  }
]

- **Thêm sản phẩm vào giỏ hàng**
  - **Phương thức**: `POST`
  - **Endpoint**: `/cart`
  - **Mô tả**: Thêm sản phẩm vào giỏ hàng.
  Đầu vào
  {
  "product_id": "integer (bắt buộc)",
  "quantity": "integer (bắt buộc, tối thiểu 1)"
}
Đầu ra
{
  "message": "Product added to cart",
  "cart_item": {
    "id": "integer",
    "product_id": "integer",
    "quantity": "integer"
  }
}

- **Cập nhật số lượng sản phẩm trong giỏ hàng**
  - **Phương thức**: `PUT`
  - **Endpoint**: `/cart/{id}`
  - **Mô tả**: Cập nhật số lượng sản phẩm trong giỏ hàng.
  Đầu vào
  {
  "quantity": "integer (bắt buộc, tối thiểu 1)"
}
Đầu ra
{
  "message": "Cart item updated",
  "cart_item": {
    "id": "integer",
    "product_id": "integer",
    "quantity": "integer"
  }
}

- **Xóa sản phẩm khỏi giỏ hàng**
  - **Phương thức**: `DELETE`
  - **Endpoint**: `/cart/{id}`
  - **Mô tả**: Xóa sản phẩm khỏi giỏ hàng.
  Đầu vào: {id} là ID của sản phẩm trong giỏ hàng.
  Đầu ra
  {
  "message": "Cart item removed"
}

### Đặt hàng
- **Hiển thị thông tin giỏ hàng và tính toán tổng tiền**
  - **Phương thức**: `POST`
  - **Endpoint**: `/checkout`
  - **Mô tả**: Hiển thị thông tin giỏ hàng, voucher và tổng tiền.
  Đầu vào
  {
  "voucher_code": "string (tùy chọn)"
}
Đầu ra
{
  "cart_items": [
    {
      "id": "integer",
      "product": {
        "id": "integer",
        "name": "string",
        "price": "float"
      },
      "quantity": "integer"
    }
  ],
  "total_cost": "float",
  "discount": "float"
}

- **Xử lý đặt hàng**
  - **Phương thức**: `POST`
  - **Endpoint**: `/order`
  - **Mô tả**: Đặt hàng và lưu thông tin đơn hàng.
  Đầu vào
  {
  "payment_method_id": "integer (bắt buộc)",
  "delivery_info": {
    "recipient_name": "string (bắt buộc)",
    "phone_number": "string (bắt buộc)",
    "address": "string (bắt buộc)"
  },
  "voucher_id": "integer (tùy chọn)"
}
Đầu ra
{
  "message": "Order placed successfully",
  "order": {
    "id": "integer",
    "user_id": "integer",
    "status_id": "integer",
    "order_date": "datetime"
  },
  "total_cost": "float",
  "discount": "float",
  "final_total": "float"
}

---

## **3. Route Quản Trị (Admin Routes)**

### Middleware: `auth:sanctum`, `role:admin`

### Quản lý sản phẩm
- **Lấy danh sách sản phẩm**
  - **Phương thức**: `GET`
  - **Endpoint**: `/admin/products`
  - **Mô tả**: Lấy danh sách tất cả sản phẩm.
  Đầu vào: token của account quản lý
  [
  {
    "id": "integer",
    "name": "string",
    "description": "string",
    "price": "float",
    "stock_quantity": "integer",
    "category": {
      "id": "integer",
      "name": "string"
    }
  }
]

- **Thêm sản phẩm mới**
  - **Phương thức**: `POST`
  - **Endpoint**: `/admin/products/create`
  - **Mô tả**: Thêm sản phẩm mới.
  Đầu vào
  {
  "name": "string (bắt buộc)",
  "description": "string (tùy chọn)",
  "price": "float (bắt buộc)",
  "stock_quantity": "integer (tùy chọn)",
  "category_id": "integer (bắt buộc)",
  "image": "file (tùy chọn, định dạng: jpeg, png, jpg, gif)"
}
Đầu ra
{
  "message": "Product created successfully",
  "product": {
    "id": "integer",
    "name": "string",
    "description": "string",
    "price": "float",
    "stock_quantity": "integer",
    "category_id": "integer",
    "image_path": "string"
  }
}

- **Cập nhật sản phẩm**
  - **Phương thức**: `PUT`
  - **Endpoint**: `/admin/products/{id}/edit`
  - **Mô tả**: Cập nhật thông tin sản phẩm.
  Đầu vào
  {
  "name": "string (tùy chọn)",
  "description": "string (tùy chọn)",
  "price": "float (tùy chọn)",
  "stock_quantity": "integer (tùy chọn)",
  "category_id": "integer (tùy chọn)",
  "image": "file (tùy chọn, định dạng: jpeg, png, jpg, gif)"
}
Đầu ra
{
  "message": "Product updated successfully",
  "product": {
    "id": "integer",
    "name": "string",
    "description": "string",
    "price": "float",
    "stock_quantity": "integer",
    "category_id": "integer",
    "image_path": "string"
  }
}

- **Xóa sản phẩm**
  - **Phương thức**: `DELETE`
  - **Endpoint**: `/admin/products/{id}`
  - **Mô tả**: Xóa sản phẩm.
  Đầu ra
  {
  "message": "Product deleted successfully"
}

### Quản lý danh mục
- **Lấy danh sách danh mục**
  - **Phương thức**: `GET`
  - **Endpoint**: `/admin/categories`
  - **Mô tả**: Lấy danh sách tất cả danh mục.
  Đầu ra
  [
  {
    "id": "integer",
    "name": "string"
  }
]   

- **Thêm danh mục mới**
  - **Phương thức**: `POST`
  - **Endpoint**: `/admin/categories/create`
  - **Mô tả**: Thêm danh mục mới.
  Đầu vào
  {
  "name": "string (bắt buộc)"
}
Đầu ra
{
  "message": "Category created successfully",
  "category": {
    "id": "integer",
    "name": "string"
  }
}

- **Cập nhật danh mục**
  - **Phương thức**: `PUT`
  - **Endpoint**: `/admin/categories/{id}/edit`
  - **Mô tả**: Cập nhật thông tin danh mục.
  Đầu vào
  {
  "name": "string (tùy chọn)"
}
Đầu ra
{
  "message": "Category updated successfully",
  "category": {
    "id": "integer",
    "name": "string"
  }
}
- **Xóa danh mục**
  - **Phương thức**: `DELETE`
  - **Endpoint**: `/admin/categories/{id}`
  - **Mô tả**: Xóa danh mục.
  Đầu ra
{
  "message": "Category deleted successfully"
}

### Quản lý mã giảm giá (Voucher)
- **Lấy danh sách mã giảm giá**
  - **Phương thức**: `GET`
  - **Endpoint**: `/admin/vouchers`
  - **Mô tả**: Lấy danh sách tất cả mã giảm giá.
  Đầu ra
  [
  {
    "id": "integer",
    "code": "string",
    "discount_percent": "float",
    "start_date": "date",
    "end_date": "date",
    "max_usage": "integer"
  }
]

- **Thêm mã giảm giá mới**
  - **Phương thức**: `POST`
  - **Endpoint**: `/admin/vouchers/create`
  - **Mô tả**: Thêm mã giảm giá mới.
  Đầu vào
  {
  "code": "string (bắt buộc, unique)",
  "discount_percent": "float (bắt buộc, từ 0 đến 100)",
  "start_date": "date (bắt buộc)",
  "end_date": "date (bắt buộc, sau hoặc bằng start_date)",
  "max_usage": "integer (tùy chọn)"
}
Đầu ra
{
  "message": "Voucher created successfully",
  "voucher": {
    "id": "integer",
    "code": "string",
    "discount_percent": "float",
    "start_date": "date",
    "end_date": "date",
    "max_usage": "integer"
  }
}

- **Cập nhật mã giảm giá**
  - **Phương thức**: `PUT`
  - **Endpoint**: `/admin/vouchers/{id}/edit`
  - **Mô tả**: Cập nhật thông tin mã giảm giá.
  Đầu vào
  {
  "code": "string (tùy chọn, unique)",
  "discount_percent": "float (tùy chọn, từ 0 đến 100)",
  "start_date": "date (tùy chọn)",
  "end_date": "date (tùy chọn, sau hoặc bằng start_date)",
  "max_usage": "integer (tùy chọn)"
}
Đầu ra
{
  "message": "Voucher updated successfully",
  "voucher": {
    "id": "integer",
    "code": "string",
    "discount_percent": "float",
    "start_date": "date",
    "end_date": "date",
    "max_usage": "integer"
  }
}

### Quản lý đơn hàng
- **Lấy danh sách đơn hàng**
  - **Phương thức**: `GET`
  - **Endpoint**: `/admin/orders`
  - **Mô tả**: Lấy danh sách tất cả đơn hàng.
  Đầu ra
  [
  {
    "id": "integer",
    "user": {
      "id": "integer",
      "email": "string",
      "full_name": "string"
    },
    "order_date": "datetime",
    "status": {
      "id": "integer",
      "name": "string"
    },
    "total_cost": "float",
    "discount": "float"
  }
]

- **Cập nhật trạng thái đơn hàng**
  - **Phương thức**: `PUT`
  - **Endpoint**: `/admin/orders/{id}/status`
  - **Mô tả**: Cập nhật trạng thái đơn hàng.
  Đầu vào
  {
  "status_id": "integer (bắt buộc)"
}
Đầu ra
{
  "message": "Order status updated successfully",
  "order": {
    "id": "integer",
    "status_id": "integer"
  }
}

### Quản lý người dùng
- **Lấy danh sách người dùng**
  - **Phương thức**: `GET`
  - **Endpoint**: `/admin/users`
  - **Mô tả**: Lấy danh sách tất cả người dùng.
  Đầu ra
  [
  {
    "id": "integer",
    "email": "string",
    "full_name": "string",
    "phone_number": "string"
  }
]

- **Lấy chi tiết người dùng**
  - **Phương thức**: `GET`
  - **Endpoint**: `/admin/users/{id}`
  - **Mô tả**: Lấy thông tin chi tiết của một người dùng.
  Đầu ra
  {
  "id": "integer",
  "email": "string",
  "full_name": "string",
  "phone_number": "string",
  "address": "string",
  "role": "string"
}

---

## Ghi chú
- Các route có middleware `auth:sanctum` yêu cầu người dùng phải đăng nhập và gửi token xác thực trong header.
- Các route có middleware `role:user` hoặc `role:admin` yêu cầu người dùng phải có vai trò tương ứng.
