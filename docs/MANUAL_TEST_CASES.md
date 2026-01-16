# Manual Test Cases - CUET Stationary App

## Test Execution Information
- **Project**: CUET Stationary App
- **Version**: 0.1.0
- **Test Date**: ___________
- **Tester Name**: ___________
- **Environment**: Development/Production

---

## Test Case 1: Student Registration
**Test Case ID**: TC_AUTH_001  
**Priority**: High  
**Module**: Authentication  
**Type**: Functional

### Objective
Verify that a new student can successfully register an account

### Pre-requisites
- Application is running
- Database is accessible
- Email is not already registered

### Test Steps
1. Navigate to `http://localhost:3000/signup`
2. Fill in the following details:
   - **Name**: John Doe
   - **Email**: john.doe@example.com
   - **Password**: Test123456
   - **Confirm Password**: Test123456
3. Check "I agree to Terms & Conditions" checkbox
4. Click "Create Account" button
5. Observe the response

### Expected Results
- ✅ Account created successfully message appears
- ✅ User is redirected to `/signin` page
- ✅ No error messages displayed
- ✅ User data saved in database

### Actual Results
_[To be filled during testing]_

### Status
- [ ] Pass
- [ ] Fail

### Screenshots/Notes
_[Attach screenshots or notes here]_

---

## Test Case 2: Student Login
**Test Case ID**: TC_AUTH_002  
**Priority**: High  
**Module**: Authentication  
**Type**: Functional

### Objective
Verify that registered student can login successfully

### Pre-requisites
- Student account exists in database
- Application is running

### Test Steps
1. Navigate to `http://localhost:3000/signin`
2. Enter credentials:
   - **Email**: john.doe@example.com
   - **Password**: Test123456
3. Click "Sign In" button
4. Observe the response

### Expected Results
- ✅ Login successful
- ✅ JWT token generated and stored
- ✅ User redirected to `/student/dashboard`
- ✅ Welcome message shows user name
- ✅ Navigation menu visible

### Actual Results
_[To be filled during testing]_

### Status
- [ ] Pass
- [ ] Fail

### Screenshots/Notes
_[Attach screenshots or notes here]_

---

## Test Case 3: Browse Products (Shop Page)
**Test Case ID**: TC_SHOP_001  
**Priority**: High  
**Module**: Student - Shopping  
**Type**: Functional

### Objective
Verify that student can view all available products

### Pre-requisites
- Student logged in
- Products exist in inventory

### Test Steps
1. From student dashboard, click "Shop" in navigation
2. Observe products displayed
3. Check product information (name, price, emoji, stock)
4. Try search functionality (if available)
5. Try category filtering (if available)

### Expected Results
- ✅ All products displayed in grid/list format
- ✅ Each product shows: name, price, emoji, stock status
- ✅ "Add to Cart" button visible for each product
- ✅ Products with zero stock show "Out of Stock"
- ✅ Search/filter works correctly

### Actual Results
_[To be filled during testing]_

### Status
- [ ] Pass
- [ ] Fail

### Screenshots/Notes
_[Attach screenshots or notes here]_

---

## Test Case 4: Add Product to Cart
**Test Case ID**: TC_CART_001  
**Priority**: High  
**Module**: Student - Shopping Cart  
**Type**: Functional

### Objective
Verify that student can add products to cart

### Pre-requisites
- Student logged in
- At least 2 products available in inventory
- Products have sufficient stock

### Test Steps
1. Navigate to `/student/shop`
2. Click "Add to Cart" on "Notebook" product
3. Verify cart icon updates with item count
4. Click "Add to Cart" on "Pen" product
5. Navigate to `/student/cart`
6. Verify both items appear in cart

### Expected Results
- ✅ Success message after adding to cart
- ✅ Cart icon shows correct item count (2)
- ✅ Both products visible in cart page
- ✅ Correct product details (name, price, quantity)
- ✅ Subtotal calculated correctly
- ✅ Total amount displayed correctly

### Actual Results
_[To be filled during testing]_

### Status
- [ ] Pass
- [ ] Fail

### Screenshots/Notes
_[Attach screenshots or notes here]_

---

## Test Case 5: Update Cart Quantity
**Test Case ID**: TC_CART_002  
**Priority**: Medium  
**Module**: Student - Shopping Cart  
**Type**: Functional

### Objective
Verify that student can update product quantity in cart

### Pre-requisites
- Student logged in
- At least 1 product in cart

### Test Steps
1. Navigate to `/student/cart`
2. Locate quantity input for first product
3. Change quantity from 1 to 3
4. Click update/save button (if required)
5. Observe the changes

### Expected Results
- ✅ Quantity updated to 3
- ✅ Subtotal recalculated (price × 3)
- ✅ Total amount updated
- ✅ Changes reflected immediately or after save

### Actual Results
_[To be filled during testing]_

### Status
- [ ] Pass
- [ ] Fail

### Screenshots/Notes
_[Attach screenshots or notes here]_

---

## Test Case 6: Place Order
**Test Case ID**: TC_ORDER_001  
**Priority**: High  
**Module**: Student - Orders  
**Type**: Functional

### Objective
Verify that student can successfully place an order

### Pre-requisites
- Student logged in
- Cart has at least 1 product
- Student profile has delivery address

### Test Steps
1. Navigate to `/student/cart`
2. Review cart items and total
3. Click "Proceed to Checkout" button
4. Fill/verify delivery details:
   - Delivery Address
   - Phone Number
   - Notes (optional)
5. Click "Place Order" button
6. Navigate to `/student/orders`

### Expected Results
- ✅ Order placed successfully message
- ✅ Cart is cleared after order
- ✅ Order appears in orders page
- ✅ Order status is "pending"
- ✅ Order details match cart items
- ✅ Total amount is correct
- ✅ Order ID generated

### Actual Results
_[To be filled during testing]_

### Status
- [ ] Pass
- [ ] Fail

### Screenshots/Notes
_[Attach screenshots or notes here]_

---

## Test Case 7: Vendor Login
**Test Case ID**: TC_AUTH_003  
**Priority**: High  
**Module**: Authentication  
**Type**: Functional

### Objective
Verify that vendor/admin can login successfully

### Pre-requisites
- Vendor account exists in database
- Application is running

### Test Steps
1. Navigate to `http://localhost:3000/signin`
2. Select "Vendor" user type (if option exists)
3. Enter vendor credentials:
   - **Email**: vendor@example.com
   - **Password**: [vendor password]
4. Click "Sign In" button
5. Observe the response

### Expected Results
- ✅ Login successful
- ✅ User redirected to `/vendor/dashboard`
- ✅ Vendor navigation menu visible
- ✅ Dashboard shows stats (revenue, orders, low stock)

### Actual Results
_[To be filled during testing]_

### Status
- [ ] Pass
- [ ] Fail

### Screenshots/Notes
_[Attach screenshots or notes here]_

---

## Test Case 8: Add New Product (Vendor)
**Test Case ID**: TC_VENDOR_001  
**Priority**: High  
**Module**: Vendor - Products  
**Type**: Functional

### Objective
Verify that vendor can add new product to inventory

### Pre-requisites
- Vendor logged in

### Test Steps
1. Navigate to `/vendor/products`
2. Click "Add Product" button
3. Fill in product details:
   - **Name**: Test Notebook
   - **Category**: Stationery
   - **Price**: 75
   - **Stock**: 50
   - **Brand**: TestBrand
   - **Description**: A quality notebook
   - **Emoji**: 📓
4. Click "Add Product" button
5. Return to products list

### Expected Results
- ✅ Product added successfully message
- ✅ New product appears in products list
- ✅ All details saved correctly
- ✅ Stock quantity matches input
- ✅ Product available for students to purchase

### Actual Results
_[To be filled during testing]_

### Status
- [ ] Pass
- [ ] Fail

### Screenshots/Notes
_[Attach screenshots or notes here]_

---

## Test Case 9: Update Order Status (Vendor)
**Test Case ID**: TC_VENDOR_002  
**Priority**: High  
**Module**: Vendor - Orders  
**Type**: Functional

### Objective
Verify that vendor can update order status

### Pre-requisites
- Vendor logged in
- At least 1 order exists with status "pending"

### Test Steps
1. Navigate to `/vendor/orders`
2. Locate an order with "pending" status
3. Click on the order or status dropdown
4. Change status to "processing"
5. Save changes
6. Verify status update

### Expected Results
- ✅ Status updated successfully
- ✅ Status shows as "processing"
- ✅ Update reflected in student's order view
- ✅ Vendor stats updated (pending orders count decreased)

### Actual Results
_[To be filled during testing]_

### Status
- [ ] Pass
- [ ] Fail

### Screenshots/Notes
_[Attach screenshots or notes here]_

---

## Test Case 10: Restock Product (Vendor)
**Test Case ID**: TC_VENDOR_003  
**Priority**: Medium  
**Module**: Vendor - Inventory  
**Type**: Functional

### Objective
Verify that vendor can restock products

### Pre-requisites
- Vendor logged in
- Product with low stock exists

### Test Steps
1. Navigate to `/vendor/inventory`
2. Locate a product with low stock (< 10)
3. Enter restock amount (e.g., 50)
4. Enter reason: "Monthly restock"
5. Click "Restock" button
6. Verify stock update

### Expected Results
- ✅ Stock updated successfully
- ✅ New stock = old stock + restock amount
- ✅ Stock adjustment logged in database
- ✅ Product no longer in low stock list (if threshold met)

### Actual Results
_[To be filled during testing]_

### Status
- [ ] Pass
- [ ] Fail

### Screenshots/Notes
_[Attach screenshots or notes here]_

---

## Test Summary

### Test Statistics
- **Total Test Cases**: 10
- **Passed**: ___
- **Failed**: ___
- **Blocked**: ___
- **Not Executed**: ___

### Pass Rate
**Pass Rate**: ___% ( Passed / Total × 100 )

### Issues Found
1. _[List any bugs or issues discovered]_
2. 
3. 

### Recommendations
_[Any suggestions for improvement]_

### Tester Sign-off
- **Name**: ___________
- **Date**: ___________
- **Signature**: ___________