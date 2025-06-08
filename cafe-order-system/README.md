# Hệ Thống Quản Lý Đặt Hàng Cafe - API Routes
- raw sql cần viết
- INSERT INTO statuses VALUES (1,'Pending',now(), now());
- INSERT INTO statuses VALUES (2,'In Transit',now(), now());
- INSERT INTO statuses VALUES (3,'Delivered',now(), now());
- INSERT INTO statuses VALUES (4,'Cancel',now(), now());

- INSERT INTO payment_methods VALUES (1,'Cash',now(), now());
- INSERT INTO payment_methods VALUES (2,'Card',now(), now());

# API Documentation

## 1. `GET /categories`
**Mô tả:**  
Lấy danh sách tất cả các danh mục sản phẩm (kể cả những danh mục chưa có sản phẩm).

**Request:**  
- Method: `GET`
- URL: `/categories`

**Response:**
- 200 OK:  
  ```json
  [
    {
      "id": 1,
      "name": "Cà phê",
      "created_at": "...",
      "updated_at": "..."
    },
    ...
  ]
  ```
- 404 Not Found:  
  ```json
  { "message": "No categories found" }
  ```

---

## 2. `GET /orders`
**Mô tả:**  
Lấy danh sách tất cả đơn hàng của người dùng hiện tại, bao gồm trạng thái và tổng giá trị từng đơn.

**Request:**  
- Method: `GET`
- URL: `/orders`
- Yêu cầu đăng nhập (Bearer Token hoặc Sanctum)

**Response:**
- 200 OK:  
  ```json
  [
    {
      "id": 1,
      "order_date": "2024-06-08",
      "status": "Pending",
      "total": 120000
    },
    ...
  ]
  ```

---

## 3. `GET /orders/{id}`
**Mô tả:**  
Lấy chi tiết đầy đủ của một đơn hàng của người dùng hiện tại.

**Request:**  
- Method: `GET`
- URL: `/orders/{id}`
- Yêu cầu đăng nhập (Bearer Token hoặc Sanctum)

**Response:**
- 200 OK:  
  ```json
  {
    "id": 1,
    "order_date": "2024-06-08",
    "status": "Pending",
    "total": 120000,
    "discount": 10000,
    "final_total": 110000,
    "products": [
      {
        "name": "Cà phê sữa",
        "quantity": 2,
        "price": 30000
      }
    ],
    "delivery_info": { ... },
    "payment_info": { ... },
    "voucher": { ... }
  }
  ```
- 404 Not Found:  
  ```json
  { "message": "Order not found" }
  ```

---

## 4. `GET /admin/orders/{id}`
**Mô tả:**  
Lấy chi tiết đầy đủ của một đơn hàng bất kỳ (dành cho admin).

**Request:**  
- Method: `GET`
- URL: `/admin/orders/{id}`
- Yêu cầu đăng nhập với quyền admin

**Response:**
- 200 OK:  
  ```json
  {
    "id": 1,
    "order_date": "2024-06-08",
    "status": "Pending",
    "user": { ... },
    "total": 120000,
    "discount": 10000,
    "final_total": 110000,
    "products": [
      {
        "name": "Cà phê sữa",
        "quantity": 2,
        "price": 30000
      }
    ],
    "delivery_info": { ... },
    "payment_info": { ... },
    "voucher": { ... }
  }
  ```
- 404 Not Found:  
  ```json
  { "message": "Order not found" }
  ```

## Hủy đơn hàng (Cancel Order)

### Endpoint
```
PUT /orders/{id}/cancel
```

### Mô tả
Cho phép người dùng hủy đơn hàng của mình **nếu đơn hàng đang ở trạng thái "Pending"**. Khi hủy thành công, trạng thái đơn hàng sẽ chuyển thành "Cancel" và trả về toàn bộ thông tin chi tiết của đơn hàng đó.

### Yêu cầu
- Người dùng phải đăng nhập (middleware: `auth:sanctum`, role: `user`)
- Chỉ hủy được đơn hàng của chính mình
- Chỉ hủy được đơn hàng có trạng thái "Pending"

### Request
- Method: `PUT`
- URL: `/orders/{id}/cancel`
- Headers:  
  `Authorization: Bearer {token}`

### Response

#### Thành công (200 OK)
```json
{
  "id": 1,
  "order_date": "2024-06-08",
  "status": "Cancel",
  "total": 120000,
  "discount": 10000,
  "final_total": 110000,
  "products": [
    {
      "name": "Cà phê sữa",
      "quantity": 2,
      "price": 30000
    }
  ],
  "delivery_info": { ... },
  "payment_info": { ... },
  "voucher": { ... }
}
```

#### Lỗi: Không tìm thấy đơn hàng (404)
```json
{ "message": "Order not found" }
```

#### Lỗi: Đơn hàng không ở trạng thái Pending (400)
```json
{ "message": "Only pending orders can be cancelled" }
```

#### Lỗi: Không tìm thấy trạng thái Cancel (500)
```json
{ "message": "Cancel status not found" }
```

### Ghi chú
- Sau khi hủy, đơn hàng vẫn được giữ lại trong hệ thống với trạng thái "Cancel".
- Các thông tin trả về giống như khi xem chi tiết đơn hàng.

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
    "phone_number": "string (bắt buộc)",
    "security_question": "required|string|max:255", 
    "answer":"required|string|max:255" 
  }
  ```
- **Đầu ra**:
  ```json
  {
  "message": "User registered successfully",
  "user": "trả tất cả các thông tin của user như trong bảng trừ password"
  }
  ```


### Đăng nhập
- **Phương thức**: `POST`
- **Endpoint**: `/login`
- **Mô tả**: Đăng nhập và nhận token xác thực.
- **Đầu vào**:
 ```json
{
  "email": "string (bắt buộc)",
  "password": "string (bắt buộc)"
}
```

- **Đầu ra**:
```json
{
  "message": "Login successful",
  "token": "string (token xác thực)",
  "user": "trả tất cả các thông tin của user như trong bảng trừ password"
}
```
### Khôi phục tài khoản qua câu hỏi bảo mật
- **Phương thức**: `POST`
- **Endpoint**: `/recover-account`
- **Mô tả**: Nhập tài khoản để lấy ra câu hỏi bảo mật.
- **Đầu vào**:
```json
  {
    "email" : "required|email"
  }
```
- **Đầu ra**: Câu hỏi bảo mật

### Khôi phục tài khoản qua câu hỏi bảo mật
- **Phương thức**: `POST`
- **Endpoint**: `/recover-account2`
- **Mô tả**: Nhập tài khoản và câu trả lời.
- **Đầu vào**:
```json
  {
    "email" : "required|email",
    "security_answer" : "required|string"
  }
```
- **Đầu ra**: Không tìm thấy tài khoản trả về json(['message' => 'Email không tồn tại'], 404)
Sai câu trả lời thì trả về json(['message' => 'Câu trả lời bảo mật không chính xác'], 400)
Tìm thấy tài khoản thì trả về json(['message' => 'Xác thực thành công.', 'user_id' => $user->id])

### Khôi phục tài khoản qua câu hỏi bảo mật
- **Phương thức**: `POST`
- **Endpoint**: `/reset-password`
- **Mô tả**: Nhập mật khẩu mới
- **Đầu vào**:
```json
  {
    "user_id" : "required|integer",
    "new_password" : "required|min:6"
  }
```
- **Đầu ra**: không tìm thấy user_id trả về json(['message' => 'Email không tồn tại'], 404);
tìm thấy thì trả về json(['message' => 'Mật khẩu đã được đặt lại thành công']);



### Lấy danh sách sản phẩm
- **Phương thức**: `GET`
- **Endpoint**: `/products`
- **Mô tả**: Lấy danh sách tất cả sản phẩm.
- **Đầu ra**
Trả về tất cả sản phẩm + category đi kèm (xem trong bảng erd để rõ hơn là có những thành phần gì)

### Lấy chi tiết sản phẩm
- **Phương thức**: `GET`
- **Endpoint**: `/products/{id}`
- **Mô tả**: Lấy thông tin chi tiết của một sản phẩm cụ thể.
- **Đầu vào**: {id} là ID của sản phẩm.
- **Đầu ra** trả tất cả thông tin về sản phẩm đấy + category đi kèm

### Lấy sản phẩm theo từ khóa tìm kiếm
- **Phương thức**: `GET`
- **Endpoint**: `/products/search/{name}`
- **Mô tả**: Lấy thông tin các sản phẩm theo search.
- **Đầu vào**: {name} là từ khóa nhập vào thanh searchbar.
- **Đầu ra** trả tất cả thông tin về sản phẩm chứa từ khóa nhập name không phân biệt in hoa thường(kiểu nhập mat hoặc MAT thì nó sẽ ra sản phẩm matcha latte, matcha matme, ... cái gì chứa mat thì nó trả ra hết) + category đi kèm

---

## **2. Route Người Dùng (User Routes) Nhớ dùng token của user mới vào được**

### Middleware: `auth:sanctum`, `role:user`

### Lấy thông tin người dùng
- **Phương thức**: `GET`
- **Endpoint**: `/user`
- **Mô tả**: Lấy thông tin tài khoản người dùng hiện tại.
- **Đầu vào**: Token xác thực trong header.
- **Đầu ra**: Tất cả các thông tin của user như trong bảng vẽ erd

### Cập nhật thông tin người dùng
- **Phương thức**: `PUT`
- **Endpoint**: `/user`
- **Mô tả**: Cập nhật thông tin tài khoản người dùng.
- **Đầu vào**
```json
{
  "full_name": "string (tùy chọn)",
  "password": "string (tùy chọn, tối thiểu 6 ký tự)",
  "phone_number": "string (tùy chọn)",
  "sex": "string (tùy chọn, giá trị: Male, Female, Other)",
  "birth_date": "date (tùy chọn)",
  "address": "string (tùy chọn)",
  "security_question" : "nullable|string|max:255",
  "answer": "nullable|string|max:255"
}
```

- **Đầu ra** tất cả thông tin user sau khi update


### Đăng xuất
- **Phương thức**: `POST`
- **Endpoint**: `/logout`
- **Mô tả**: Đăng xuất và xóa token xác thực.
- **Đầu vào**: Token xác thực trong header.
- **Đầu ra**
```json
{
  "message": "Logged out successfully"
}
```

### Quản lý giỏ hàng
- **Xem giỏ hàng**
  - **Phương thức**: `GET`
  - **Endpoint**: `/cart`
  - **Mô tả**: Lấy danh sách sản phẩm trong giỏ hàng.
-**Đầu vào**: Token xác thực trong header.
-  **Đầu ra**: Tất cả các sản phẩm có trong giỏ hàng, đầy đủ thông tin của bảng product
Nếu không có sản phẩm nào trong giỏ hàng thì nó trả về json(['message' => 'Cart is empty'], 200);

- **Thêm sản phẩm vào giỏ hàng**
  - **Phương thức**: `POST`
  - **Endpoint**: `/cart`
  - **Mô tả**: Thêm sản phẩm vào giỏ hàng.
- **Đầu vào**
```json
  {
  "product_id": "integer (bắt buộc)",
  "quantity": "integer (bắt buộc, tối thiểu 1)"
  }
```
- **Đầu ra**: json(['message' => 'Product added to cart', 'cart_item' => $cartItem]); cart_item là sản phẩm vừa được thêm vào

-**Cập nhật số lượng sản phẩm trong giỏ hàng**
  - **Phương thức**: `PUT`
  - **Endpoint**: `/cart/{id}`
  - **Mô tả**: Cập nhật số lượng sản phẩm trong giỏ hàng.
- **Đầu vào**
```json
  {
  "quantity": "integer (bắt buộc, tối thiểu 1)"
}
```
- **Đầu ra**
```json
{
  "message": "Cart item updated",
  "cart_item": {
    "id": "integer",
    "product_id": "integer",
    "quantity": "integer"
  }
}
```

- **Xóa sản phẩm khỏi giỏ hàng**
  - **Phương thức**: `DELETE`
  - **Endpoint**: `/cart/{id}`
  - **Mô tả**: Xóa sản phẩm khỏi giỏ hàng.
- **Đầu vào**: {id} là ID của sản phẩm trong giỏ hàng.
- **Đầu ra**
```json
  {
  "message": "Cart item removed"
}
```

### Đặt hàng
- **Hiển thị thông tin giỏ hàng và tính toán tổng tiền**
  - **Phương thức**: `POST`
  - **Endpoint**: `/checkout`
  - **Mô tả**: Hiển thị thông tin giỏ hàng, voucher và tổng tiền.
- **Đầu vào**: token của người dùng
```json
  {
  "voucher_code": "string (tùy chọn)",
  "address": "string(tùy chọn)"
}
```
- **Đầu ra**
```json
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
  "discount": "float",
  "default_address" : "string",
  "payment_methods" : "các cách trả tiền cash, card,...",
}
```

- **Xử lý đặt hàng**
  - **Phương thức**: `POST`
  - **Endpoint**: `/order`
  - **Mô tả**: Đặt hàng và lưu thông tin đơn hàng.
- **Đầu vào**
```json
  {
  "payment_method_id": "integer (bắt buộc)",
  "delivery_info": {
    "recipient_name": "string (bắt buộc)",
    "phone_number": "string (bắt buộc)",
    "address": "string (bắt buộc)"
  },
  "voucher_id": "integer (tùy chọn)"
}
```
-**Đầu ra**
```json
{
  "message": "Order placed successfully",
  "order": {
    "id": "integer",
    "user_id": "integer",
    "status_id": "integer",
    "order_date": "datetime",
    "bla bla(mấy cái thành phần của bảng order trả ra hết)"
  },
  "total_cost": "float",
  "discount": "float",
  "final_total": "float"
}
```
---

## **3. Route Quản Trị (Admin Routes)**

### Middleware: `auth:sanctum`, `role:admin`

### Quản lý sản phẩm
- **Lấy danh sách sản phẩm**
  - **Phương thức**: `GET`
  - **Endpoint**: `/admin/products`
  - **Mô tả**: Lấy danh sách tất cả sản phẩm.
- **Đầu vào**: token của account quản lý
-- **Đầu ra**: tất cả các sản phẩm đang có ở cửa hàng

- **Thêm sản phẩm mới**
  - **Phương thức**: `POST`
  - **Endpoint**: `/admin/products/create`
  - **Mô tả**: Thêm sản phẩm mới.
-- **Đầu vào**
```json
  {
  "name": "string (bắt buộc)",
  "description": "string (tùy chọn)",
  "price": "float (bắt buộc)",
  "stock_quantity": "integer (tùy chọn)",
  "category_id": "integer (bắt buộc)",
  "image": "file (tùy chọn, định dạng: jpeg, png, jpg, gif)"
}
```
- **Đầu ra**
```json
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
```

- **Cập nhật sản phẩm**
  - **Phương thức**: `PUT`
  - **Endpoint**: `/admin/products/{id}/edit`
  - **Mô tả**: Cập nhật thông tin sản phẩm.
- **Đầu vào**
```json
  {
  "name": "string (tùy chọn)",
  "description": "string (tùy chọn)",
  "price": "float (tùy chọn)",
  "stock_quantity": "integer (tùy chọn)",
  "category_id": "integer (tùy chọn)",
  "image": "file (tùy chọn, định dạng: jpeg, png, jpg, gif)"
}
```
- **Đầu ra**
```json
{
  "message": "Product updated successfully",
  "product": "đầy đủ các thông tin check trong bảng nhá"
}
```

- **Xóa sản phẩm**
  - **Phương thức**: `DELETE`
  - **Endpoint**: `/admin/products/{id}`
  - **Mô tả**: Xóa sản phẩm.
- **Đầu ra**
```json
  {
  "message": "Product deleted successfully"
}
```

### Quản lý danh mục
- **Lấy danh sách danh mục**
  - **Phương thức**: `GET`
  - **Endpoint**: `/admin/categories`
  - **Mô tả**: Lấy danh sách tất cả danh mục.
- **Đầu ra**
```json
  [
  {
    "id": "integer",
    "name": "string"
  }
]   
```

- **Thêm danh mục mới**
  - **Phương thức**: `POST`
  - **Endpoint**: `/admin/categories/create`
  - **Mô tả**: Thêm danh mục mới.
- **Đầu vào**
```json
  {
  "name": "string (bắt buộc)"
}
```
- **Đầu ra**
```json
{
  "message": "Category created successfully",
  "category": {
    "id": "integer",
    "name": "string"
  }
}
```
- **Cập nhật danh mục**
  - **Phương thức**: `PUT`
  - **Endpoint**: `/admin/categories/{id}/edit`
  - **Mô tả**: Cập nhật thông tin danh mục.
-- **Đầu vào**
```json
  {
  "name": "string (tùy chọn)"
}
```
-- **Đầu ra**
```json
{
  "message": "Category updated successfully",
  "category": {
    "id": "integer",
    "name": "string"
  }
}
```
- **Xóa danh mục**
  - **Phương thức**: `DELETE`
  - **Endpoint**: `/admin/categories/{id}`
  - **Mô tả**: Xóa danh mục.
- **Đầu ra**
```json
{
  "message": "Category deleted successfully"
}
```
### Quản lý mã giảm giá (Voucher)
- **Lấy danh sách mã giảm giá**
  - **Phương thức**: `GET`
  - **Endpoint**: `/admin/vouchers`
  - **Mô tả**: Lấy danh sách tất cả mã giảm giá.
- **Đầu ra**
```json
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
```
- **Thêm mã giảm giá mới**
  - **Phương thức**: `POST`
  - **Endpoint**: `/admin/vouchers/create`
  - **Mô tả**: Thêm mã giảm giá mới.
- **Đầu vào**
```json
  {
  "code": "string (bắt buộc, unique)",
  "discount_percent": "float (bắt buộc, từ 0 đến 100)",
  "start_date": "date (bắt buộc)",
  "end_date": "date (bắt buộc, sau hoặc bằng start_date)",
  "max_usage": "integer (tùy chọn)"
}
```
- **Đầu ra**
```json
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
```

- **Cập nhật mã giảm giá**
  - **Phương thức**: `PUT`
  - **Endpoint**: `/admin/vouchers/{id}/edit`
  - **Mô tả**: Cập nhật thông tin mã giảm giá.
- **Đầu vào**
```json
  {
  "code": "string (tùy chọn, unique)",
  "discount_percent": "float (tùy chọn, từ 0 đến 100)",
  "start_date": "date (tùy chọn)",
  "end_date": "date (tùy chọn, sau hoặc bằng start_date)",
  "max_usage": "integer (tùy chọn)"
}
```
- **Đầu ra**
```json
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
```

### Quản lý đơn hàng
- **Lấy danh sách đơn hàng**
  - **Phương thức**: `GET`
  - **Endpoint**: `/admin/orders`
  - **Mô tả**: Lấy danh sách tất cả đơn hàng.
- **Đầu ra**
```json
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
```

- **Cập nhật trạng thái đơn hàng**
  - **Phương thức**: `PUT`
  - **Endpoint**: `/admin/orders/{id}/status`
  - **Mô tả**: Cập nhật trạng thái đơn hàng.
- **Đầu vào**
```json
  {
  "status_id": "integer (bắt buộc)"
}
```
- **Đầu ra**
```json
{
  "message": "Order status updated successfully",
  "order": {
    "id": "integer",
    "status_id": "integer"
  }
}
```

### Quản lý người dùng
- **Lấy danh sách người dùng**
  - **Phương thức**: `GET`
  - **Endpoint**: `/admin/users`
  - **Mô tả**: Lấy danh sách tất cả người dùng.
- **Đầu ra**
```json
  [
  {
    "id": "integer",
    "email": "string",
    "full_name": "string",
    "phone_number": "string"
  }
]
```

- **Lấy chi tiết người dùng**
  - **Phương thức**: `GET`
  - **Endpoint**: `/admin/users/{id}`
  - **Mô tả**: Lấy thông tin chi tiết của một người dùng.
- **Đầu ra**
```json
  {
  "id": "integer",
  "email": "string",
  "full_name": "string",
  "phone_number": "string",
  "address": "string",
  "role": "string"
}
```
---

## Ghi chú
- Các route có middleware `auth:sanctum` yêu cầu người dùng phải đăng nhập và gửi token xác thực trong header.
- Các route có middleware `role:user` hoặc `role:admin` yêu cầu người dùng phải có vai trò tương ứng.
