# Authentication Backend with Role-Based Access Control

This is a Node.js backend for authentication with role-based access control (RBAC), built with Express and MongoDB.

## Features

- User registration and login
- JWT-based authentication
- Role-based access control with three roles: User, Moderator, and Admin
- Password hashing with bcrypt
- Input validation
- User management (CRUD operations)
- API endpoints for authentication and user management

## Prerequisites

- Node.js (v14+ recommended)
- MongoDB (local instance or MongoDB Atlas)

## Setup

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/auth_db
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
```

Replace `your_jwt_secret_key_here` with a strong secret key.

5. Start the development server:

```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile (requires authentication)
- `POST /api/auth/change-password` - Change password (requires authentication)

### User Management

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)
- `PATCH /api/users/:id/roles` - Change user roles (admin only)

## Authentication Flow

The authentication flow works as follows:

1. User registers with username, email, and password
2. User logs in with email and password
3. Upon successful login, a JWT token is issued
4. This token must be included in the Authorization header for protected routes:
   ```
   Authorization: Bearer <token>
   ```

## Role-Based Access Control

The system uses the following roles:

- `user` - Regular user (default role)
- `moderator` - Can access moderator-specific features
- `admin` - Full access to all features, including user management

When creating a new user, they are assigned the `user` role by default. Only admins can change user roles.

## Error Handling

All API endpoints return appropriate status codes and error messages in case of failure. For validation errors, a detailed list of validation errors is returned.

## Security

- Passwords are hashed using bcrypt before storage
- JWTs are used for stateless authentication
- Input validation is performed using express-validator
- MongoDB injection is prevented using Mongoose's schema validation

## Development

For development, the server uses nodemon to automatically restart when changes are detected:

```bash
npm run dev
```
