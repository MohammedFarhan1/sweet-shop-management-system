# Sweet Shop Frontend

React + TypeScript + Tailwind CSS frontend for the Sweet Shop Management System.

## Features

- **Authentication** - Login/Register with JWT
- **Dashboard** - Browse and purchase sweets
- **Search & Filter** - Find sweets by name, category, price
- **Admin Panel** - Manage sweets (CRUD operations)
- **Inventory Management** - Purchase and restock functionality
- **Responsive Design** - Works on desktop and mobile

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

1. **Start Backend** - Make sure backend is running on `http://localhost:5000`
2. **Register/Login** - Create account or login
3. **Browse Sweets** - View available sweets on dashboard
4. **Purchase** - Select quantity and purchase sweets
5. **Admin Features** - Admin users can manage inventory

## Admin Access

To become an admin:
1. Register a new account
2. Manually update the user role in MongoDB to 'ADMIN'
3. Login again to access admin features

## Tech Stack

- React 18 with TypeScript
- Tailwind CSS for styling
- Axios for API calls
- Context API for state management