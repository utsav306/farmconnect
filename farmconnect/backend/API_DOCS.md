# API Documentation

## Authentication Endpoints

### Register a New User

**Endpoint:** `POST /api/auth/register`

**Description:** Create a new user account

**Request Body:**

```json
{
  "username": "johndoe",
  "email": "johndoe@example.com",
  "password": "Password123"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "614c5b68b3b4a83e8456a18f",
    "username": "johndoe",
    "email": "johndoe@example.com",
    "roles": ["user"],
    "isActive": true,
    "createdAt": "2023-09-23T14:32:24.123Z",
    "updatedAt": "2023-09-23T14:32:24.123Z"
  }
}
```

### Login

**Endpoint:** `POST /api/auth/login`

**Description:** Login with email and password

**Request Body:**

```json
{
  "email": "johndoe@example.com",
  "password": "Password123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "614c5b68b3b4a83e8456a18f",
    "username": "johndoe",
    "email": "johndoe@example.com",
    "roles": ["user"],
    "isActive": true,
    "lastLogin": "2023-09-23T15:40:10.123Z",
    "createdAt": "2023-09-23T14:32:24.123Z",
    "updatedAt": "2023-09-23T15:40:10.123Z"
  }
}
```

### Get Current User Profile

**Endpoint:** `GET /api/auth/me`

**Description:** Get the profile of the authenticated user

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "user": {
    "_id": "614c5b68b3b4a83e8456a18f",
    "username": "johndoe",
    "email": "johndoe@example.com",
    "roles": ["user"],
    "isActive": true,
    "lastLogin": "2023-09-23T15:40:10.123Z",
    "createdAt": "2023-09-23T14:32:24.123Z",
    "updatedAt": "2023-09-23T15:40:10.123Z"
  }
}
```

### Change Password

**Endpoint:** `POST /api/auth/change-password`

**Description:** Change the authenticated user's password

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "currentPassword": "Password123",
  "newPassword": "NewPassword456"
}
```

**Response:**

```json
{
  "message": "Password changed successfully"
}
```

## User Management Endpoints

### Get All Users (Admin Only)

**Endpoint:** `GET /api/users`

**Description:** Get all users in the system

**Headers:**

```
Authorization: Bearer <token> (Admin token)
```

**Response:**

```json
{
  "users": [
    {
      "_id": "614c5b68b3b4a83e8456a18f",
      "username": "johndoe",
      "email": "johndoe@example.com",
      "roles": ["user"],
      "isActive": true,
      "lastLogin": "2023-09-23T15:40:10.123Z",
      "createdAt": "2023-09-23T14:32:24.123Z",
      "updatedAt": "2023-09-23T15:40:10.123Z"
    },
    {
      "_id": "614c5d2cb3b4a83e8456a190",
      "username": "admin",
      "email": "admin@example.com",
      "roles": ["admin", "user"],
      "isActive": true,
      "lastLogin": "2023-09-23T16:10:15.123Z",
      "createdAt": "2023-09-23T14:40:12.123Z",
      "updatedAt": "2023-09-23T16:10:15.123Z"
    }
  ]
}
```

### Get User by ID

**Endpoint:** `GET /api/users/:id`

**Description:** Get a specific user by ID

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "user": {
    "_id": "614c5b68b3b4a83e8456a18f",
    "username": "johndoe",
    "email": "johndoe@example.com",
    "roles": ["user"],
    "isActive": true,
    "lastLogin": "2023-09-23T15:40:10.123Z",
    "createdAt": "2023-09-23T14:32:24.123Z",
    "updatedAt": "2023-09-23T15:40:10.123Z"
  }
}
```

### Update User

**Endpoint:** `PUT /api/users/:id`

**Description:** Update a user's profile

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body (Regular user can only update their own profile):**

```json
{
  "username": "john_doe",
  "email": "john.doe@example.com"
}
```

**Request Body (Admin can update any user including roles and status):**

```json
{
  "username": "john_doe",
  "email": "john.doe@example.com",
  "roles": ["user", "moderator"],
  "isActive": true
}
```

**Response:**

```json
{
  "message": "User updated successfully",
  "user": {
    "_id": "614c5b68b3b4a83e8456a18f",
    "username": "john_doe",
    "email": "john.doe@example.com",
    "roles": ["user", "moderator"],
    "isActive": true,
    "lastLogin": "2023-09-23T15:40:10.123Z",
    "createdAt": "2023-09-23T14:32:24.123Z",
    "updatedAt": "2023-09-23T16:25:10.123Z"
  }
}
```

### Delete User (Admin Only)

**Endpoint:** `DELETE /api/users/:id`

**Description:** Delete a user

**Headers:**

```
Authorization: Bearer <token> (Admin token)
```

**Response:**

```json
{
  "message": "User deleted successfully"
}
```

### Change User Roles (Admin Only)

**Endpoint:** `PATCH /api/users/:id/roles`

**Description:** Update a user's roles

**Headers:**

```
Authorization: Bearer <token> (Admin token)
```

**Request Body:**

```json
{
  "roles": ["user", "moderator"]
}
```

**Response:**

```json
{
  "message": "User roles updated successfully",
  "user": {
    "_id": "614c5b68b3b4a83e8456a18f",
    "username": "john_doe",
    "email": "john.doe@example.com",
    "roles": ["user", "moderator"],
    "isActive": true,
    "lastLogin": "2023-09-23T15:40:10.123Z",
    "createdAt": "2023-09-23T14:32:24.123Z",
    "updatedAt": "2023-09-23T16:30:15.123Z"
  }
}
```

## Error Responses

### Validation Error

```json
{
  "errors": [
    {
      "value": "jo",
      "msg": "Username must be between 3 and 20 characters",
      "param": "username",
      "location": "body"
    },
    {
      "value": "invalid-email",
      "msg": "Must be a valid email address",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### Authentication Error

```json
{
  "message": "Invalid credentials"
}
```

### Token Error

```json
{
  "message": "Invalid token"
}
```

### Authorization Error

```json
{
  "message": "Requires admin role"
}
```

### Not Found Error

```json
{
  "message": "User not found"
}
```
