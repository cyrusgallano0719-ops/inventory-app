# Backend Setup Guide

## Running the Backend Locally

```bash
cd backend
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products (requires auth)
- `POST /api/products` - Add product (requires auth)
- `PUT /api/products/:id` - Update product (requires auth)
- `DELETE /api/products/:id` - Delete product (requires auth)

### Transactions
- `GET /api/transactions` - Get all transactions (requires auth)
- `POST /api/transactions` - Add transaction (requires auth)
- `DELETE /api/transactions` - Delete transactions by filter (requires auth)

## Database

SQLite database is automatically created at `backend/inventory.db`

## Environment Variables

Copy `.env.example` to `.env` and update values:
```
PORT=5000
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## Frontend Integration

The frontend needs to:
1. Store JWT token from login response
2. Include token in Authorization header for all API requests
3. Call API endpoints instead of using in-memory arrays

See `../API_CLIENT_SETUP.md` for frontend integration guide.
