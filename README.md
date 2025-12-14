## 👋 Hi, I'm Mohammed Farhan

I’m a **Full Stack Developer** with hands-on experience in building scalable web applications using modern frontend and backend technologies. I enjoy designing clean architectures, developing RESTful APIs, and creating user-friendly interfaces.

This my work, projects, and experiments focused on full-stack development, problem-solving, and real-world application design.

📧 Email: mohammed.farhan.dev@gmail.com  
📞 Phone: +91 94983 58776  
💻 GitHub: https://github.com/MohammedFarhan1  
🌐 Portfolio: https://mohammedfarhan1.github.io/My-Portfolio-Website

# Sweet Shop Management System

A full-stack web application for managing a sweet shop's inventory, built using **Test-Driven Development (TDD)** principles with Node.js, TypeScript, Express.js, MongoDB, and React.

## 🎯 Project Overview

This project demonstrates a complete sweet shop management system with user authentication, role-based authorization, inventory management, and comprehensive testing. The system allows customers to browse and purchase sweets while providing administrators with full inventory control.

## 🛠 Tech Stack

### Backend
- **Node.js** with **TypeScript**
- **Express.js** - Web framework
- **MongoDB Atlas** - Database (Mongoose ODM)
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Jest + Supertest** - Testing framework

### Frontend
- **React** with **Vite + TypeScript**
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Context API** - State management

## 🏗 Architecture

The backend follows **Clean Architecture** principles with clear separation of concerns:

```
backend/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server entry point
│   ├── config/
│   │   └── db.ts              # Database connection
│   ├── modules/
│   │   ├── auth/              # Authentication module
│   │   │   ├── user.model.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.test.ts
│   │   ├── sweets/            # Sweets management module
│   │   │   ├── sweet.model.ts
│   │   │   ├── sweet.service.ts
│   │   │   ├── sweet.controller.ts
│   │   │   ├── sweet.routes.ts
│   │   │   └── sweet.test.ts
│   │   └── inventory/         # Inventory management module
│   │       ├── inventory.service.ts
│   │       └── inventory.test.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts # JWT authentication
│   │   └── role.middleware.ts # Role-based authorization
│   └── utils/
└── tests/
```

## 🚀 Features

### ✅ User Authentication
- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (USER/ADMIN)

### ✅ Sweet Management (Admin Only)
- Create new sweets
- Update sweet information
- Delete sweets
- View all sweets

### ✅ Sweet Browsing (All Users)
- View all available sweets
- Search sweets by name, category, or price range
- Filter functionality

### ✅ Inventory Management
- **Purchase** - Users can buy sweets (reduces quantity)
- **Restock** - Admins can add inventory (increases quantity)
- Stock validation (prevents overselling)
- Out-of-stock handling

## 📊 Database Schema

### User Schema
```typescript
{
  name: string,
  email: string (unique),
  password: string (hashed),
  role: 'USER' | 'ADMIN',
  createdAt: Date
}
```

### Sweet Schema
```typescript
{
  name: string,
  category: string,
  price: number (>= 0),
  quantity: number (>= 0),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/register  # Register new user
POST /api/auth/login     # User login
```

### Sweets Management
```
GET    /api/sweets              # Get all sweets (AUTH)
GET    /api/sweets/search       # Search sweets (AUTH)
POST   /api/sweets              # Create sweet (ADMIN)
PUT    /api/sweets/:id          # Update sweet (ADMIN)
DELETE /api/sweets/:id          # Delete sweet (ADMIN)
```

### Inventory Management
```
POST /api/sweets/:id/purchase   # Purchase sweet (AUTH)
POST /api/sweets/:id/restock    # Restock sweet (ADMIN)
```

## 🧪 Test-Driven Development (TDD)

This project strictly follows the **Red → Green → Refactor** TDD cycle:

### Test Coverage
- **30 comprehensive tests** covering all functionality
- **Unit tests** for services and business logic
- **Integration tests** for API endpoints
- **Authentication & authorization tests**
- **Error handling and edge cases**

### Test Categories
1. **Authentication Tests** (6 tests)
   - User registration (success/failure scenarios)
   - User login (success/failure scenarios)
   - Input validation

2. **Sweet Management Tests** (13 tests)
   - CRUD operations with proper authorization
   - Search functionality
   - Input validation and error handling

3. **Inventory Tests** (11 tests)
   - Purchase functionality with stock validation
   - Restock functionality (admin-only)
   - Out-of-stock scenarios

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/MohammedFarhan1/sweet-shop-management-system.git
   cd sweet-shop-management-system/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb+srv://sweetshop_admin:admin123@sweet-shop-cluster.thrjcvk.mongodb.net/sweetshop?retryWrites=true&w=majority
   JWT_SECRET=your-secret-key-here
   PORT=5000
   ```

4. **Run tests**
   ```bash
   npm test              # Run all tests
   npm run test:watch    # Run tests in watch mode
   npm run test:coverage # Run tests with coverage
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

### Full Application Setup

1. **Start Backend** (Terminal 1)
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📝 API Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create a sweet (Admin only)
```bash
curl -X POST http://localhost:5000/api/sweets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Chocolate Cake",
    "category": "Cakes",
    "price": 25.99,
    "quantity": 10
  }'
```

### Purchase a sweet
```bash
curl -X POST http://localhost:5000/api/sweets/SWEET_ID/purchase \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "quantity": 2
  }'
```

## 🔍 Search Examples

### Search by name
```
GET /api/sweets/search?name=chocolate
```

### Search by category
```
GET /api/sweets/search?category=cakes
```

### Search by price range
```
GET /api/sweets/search?minPrice=10&maxPrice=50
```

## 🚦 Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run specific test files
npm test -- --testPathPatterns=auth
npm test -- --testPathPatterns=sweets
npm test -- --testPathPatterns=inventory

# Run tests with coverage
npm run test:coverage
```

## 🤖 My AI Usage

### 🛠️ AI Tools Used

* **ChatGPT (GPT-4)** – Used as a development assistance tool

### 👨‍💻 What I Designed & Implemented

* 🧩 **Backend architecture and system design** based on project requirements
* 🧪 **Test-Driven Development (TDD) approach** and test planning
* 🗄️ **Database models and schema structure** with validations
* 🔐 **Authentication and authorization flow** using JWT
* 🔗 **API design, endpoints, and controller logic**
* 🧱 **Project structure** following clean code and SOLID principles
* 🧠 **Overall technical decisions and architecture**

### 🤖 What Was Assisted by AI

* 🧾 **Code suggestions and boilerplate generation**
* 🧪 **Initial test case templates**
* ✨ **Syntax refinement and optimization ideas**
* 📝 **Documentation structuring and wording support**

### ✍️ What I Modified Manually

* ⚙️ **Business logic implementation and refinements**
* 🌐 **MongoDB Atlas connection configuration**
* 🛡️ **Security tuning and JWT configuration**
* 🗂️ **Git repository setup, commits, and version control**
* 🧪 **Test improvements, edge-case handling, and validation**
* 🔍 **Code review, refactoring, and final architecture decisions**

### Reflection on Productivity & Risks

#### ✅ Productivity Benefits
- **Rapid prototyping** - Complete backend built in hours vs days
- **Comprehensive testing** - 30 tests written following TDD principles
- **Clean architecture** - Proper separation of concerns implemented
- **Best practices** - Security, validation, and error handling included
- **Documentation** - Detailed README and code comments generated

#### ⚠️ Risks & Considerations
- **Code understanding** - Need to thoroughly review AI-generated code
- **Testing validation** - Must verify tests actually test the right scenarios
- **Security review** - AI-generated security code needs manual verification
- **Business logic** - Domain-specific requirements need human oversight
- **Maintenance** - Long-term code maintainability requires human understanding

#### 🎯 Best Practices Used
- **TDD methodology** - Red → Green → Refactor cycle strictly followed
- **Incremental commits** - Each feature committed separately with proper messages
- **Code review** - All AI-generated code reviewed before committing
- **Test coverage** - Comprehensive test scenarios covering edge cases
- **Clean commits** - Proper git history with AI co-authorship attribution

## 🎨 Frontend Features

### ✅ User Interface
- **Responsive Design** - Works on desktop and mobile
- **Authentication UI** - Login/Register forms
- **Dashboard** - Browse and search sweets
- **Admin Panel** - Manage sweets and inventory
- **Real-time Updates** - Instant feedback on actions

### ✅ User Experience
- **Search & Filter** - Find sweets by name, category, price
- **Purchase Flow** - Select quantity and buy sweets
- **Admin Management** - CRUD operations for sweets
- **Inventory Control** - Restock functionality
- **Error Handling** - User-friendly error messages

## 🚀 Next Steps

1. **Deployment** - Backend to Railway/Render, Frontend to Vercel
2. **Advanced Features** - Order history, payment integration, analytics
3. **Performance** - Caching, pagination, optimization
4. **Security** - Rate limiting, input sanitization, HTTPS
5. **Testing** - Frontend unit and integration tests

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow TDD principles (write tests first!)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

---

**Built with ❤️ using Test-Driven Development and AI assistance**
