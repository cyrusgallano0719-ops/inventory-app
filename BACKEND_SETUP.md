# Backend Setup Complete

Your Inventory App now has a backend with SQLite database and authentication!

## Quick Start

### Terminal 1 - Backend
```bash
cd backend
npm start
```
Backend runs on `http://localhost:5000`

### Terminal 2 - Frontend
```bash
npm start
```
Frontend runs on `http://localhost:3000`

## What's New

### Backend Features
- **Express.js** - REST API server
- **SQLite** - File-based database (auto-created)
- **JWT Authentication** - Secure user sessions
- **Bcrypt** - Password encryption
- **User Accounts** - Each user has isolated data

### API Endpoints
```
POST   /api/auth/signup          - Create account
POST   /api/auth/login           - Login

GET    /api/products             - List products
POST   /api/products             - Add product
PUT    /api/products/:id         - Update product
DELETE /api/products/:id         - Delete product

GET    /api/transactions         - List transactions
POST   /api/transactions         - Record transaction
DELETE /api/transactions         - Clear filtered transactions
```

## Migration Steps

1. **Add API client** - Already included in `api-client.js`
2. **Add login UI** - See `API_INTEGRATION_GUIDE.md`
3. **Update frontend functions** - Follow examples in guide
4. **Test endpoints** - Use Postman or curl
5. **Deploy both parts** - Backend and frontend separately

## Database Structure

```
users
├── id (PRIMARY KEY)
├── username (UNIQUE)
├── password (hashed)
└── email

products
├── id
├── userId (FOREIGN KEY)
├── name
├── category
├── stock
├── low
├── cost
└── sell

transactions
├── id
├── userId (FOREIGN KEY)
├── productId (FOREIGN KEY)
├── productName
├── type (in/out)
├── qty
├── price
├── note
└── date
```

## Environment Variables

### Backend `.env`
```
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

### Frontend (in api-client.js)
```javascript
const API_BASE = 'http://localhost:5000/api';
```

## Deployment

### Backend Deployment Options
- **Render.com** (free tier available)
- **Railway.app** (simple + free)
- **Heroku** (paid)
- **Your own server**

### Frontend Deployment
- **Vercel** (existing setup)
- Update `API_BASE` to point to production backend

## Development Tips

### Test Backend
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'
```

### Database
- SQLite database file: `backend/inventory.db`
- Delete it to reset all data
- No complex setup needed

## Next Steps

1. Read `API_INTEGRATION_GUIDE.md` for migration details
2. Update frontend functions to use API (see examples)
3. Test login functionality
4. Deploy backend to production
5. Update frontend to point to production API

## Support Files

- `backend/package.json` - Backend dependencies
- `backend/server.js` - Express app
- `backend/database.js` - SQLite setup
- `backend/routes-auth.js` - Auth endpoints
- `backend/routes-products.js` - Product endpoints
- `backend/routes-transactions.js` - Transaction endpoints
- `api-client.js` - Frontend API helper
- `API_INTEGRATION_GUIDE.md` - Migration guide
