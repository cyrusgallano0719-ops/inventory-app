# Control Panel - Super Admin Feature

## Overview

The Control Panel is an exclusive admin interface for **master_admin** (super admin) users. It provides centralized management of system-wide settings and dropdowns that regular users cannot modify.

## Who Can Access?

Only users with the **master_admin** role can:
- See the "Control Panel" tab in the sidebar navigation
- Access the control panel page
- Manage product categories

## Features

### 1. Category Management

The Control Panel includes a complete category management system where super admins can:

#### Add Categories
- Click "+ Add Category" button
- Enter category name
- Choose a color using the color picker
- Color is displayed as a hex value (#RRGGBB)
- Save to add to the system

#### Edit Categories
- Click "Edit" on any category row
- Modify the name and color
- Save changes

#### Delete Categories
- Click "Delete" on any category row
- System validates that the category is not in use
- If category has products, deletion is prevented with a message
- Otherwise, category is removed

#### Default Categories

The system automatically creates these categories on first run:
- **Electronics** - #185FA5 (blue)
- **Food & Beverage** - #1D9E75 (green)
- **Clothing** - #D85A30 (orange)
- **Tools** - #BA7517 (brown)
- **Other** - #7F77DD (purple)

## How It Works

### When Products Are Added/Edited

The product add/edit modal automatically:
1. Loads categories from the database
2. Populates the category dropdown dynamically
3. Uses only the categories managed in the Control Panel
4. Shows the first available category by default

### Role-Based Access

```
Role          | View Control Panel | Manage Categories
------------- | ------------------ | -----------------
user          | ❌ No              | ❌ No
cashier       | ❌ No              | ❌ No
admin         | ❌ No              | ❌ No
master_admin  | ✅ Yes             | ✅ Yes
```

## Database Structure

Categories are stored in the `categories` table:

```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,           -- Links to user who manages it
  name TEXT NOT NULL UNIQUE,         -- Category name
  color TEXT NOT NULL DEFAULT '#185FA5',  -- Hex color code
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
)
```

## API Endpoints

All category endpoints require authentication and master_admin role:

### Get All Categories
```
GET /api/categories
Response: Array of category objects
[
  {
    "id": 1,
    "userId": 1,
    "name": "Electronics",
    "color": "#185FA5",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  ...
]
```

### Add Category
```
POST /api/categories
Body: { "name": "New Category", "color": "#FF0000" }
Response: { "id": 6, "name": "New Category", "color": "#FF0000", ... }
```

### Update Category
```
PUT /api/categories/:id
Body: { "name": "Updated Name", "color": "#00FF00" }
Response: { "success": true }
```

### Delete Category
```
DELETE /api/categories/:id
Response: { "success": true }
Error (if in use): { "error": "Cannot delete category with X product(s)..." }
```

## Security Features

1. **Role Validation** - All endpoints check for master_admin role
2. **Frontend UI** - Control Panel hidden for non-master_admin users
3. **Database Constraints** - Categories linked to specific user
4. **Validation** - Prevents deletion of in-use categories
5. **Color Validation** - Ensures valid hex color format

## Future Expansion

The Control Panel framework can be extended to manage other system settings:
- Payment methods
- Tax rates
- Discount types
- User roles and permissions
- Report templates
- System configuration

Just follow the same pattern:
1. Add table to database
2. Create API routes
3. Add management UI to Control Panel page
4. Add permission checks
5. Update frontend to use dynamic data
