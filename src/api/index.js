// src/api/index.js
export * as authApi     from './auth';
export * as productApi  from './products';
export * as categoryApi from './categories';
export * as orderApi    from './orders';
export * as userApi     from './users';
export * as cartApi      from './cart';
export * as voucherApi   from './vouchers';
export * as rankApi      from './ranks';

export * as adminCategoryApi from './admin/categories';
export * as adminProductApi  from './admin/products';
export * as adminVoucherApi  from './admin/vouchers';
export * as adminOrderApi    from './admin/orders';
export * as adminUserApi     from './admin/users';

export { default as usersApi } from './users';

export * as userProfileApi from './user/profile';
export * as userCartApi from './user/cart';
export * as userCheckoutApi from './user/checkout';
export * as userOrderApi from './user/order';