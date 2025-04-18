# Hotel Management System API Documentation

## Table of Contents
- [Auth API](#auth-api)
  - [Login](#login-1)
  - [Register](#register-1)
- [Admin API](#admin-api)
  - [Get All Admins](#get-all-admins)
  - [Create Admin](#create-admin)
  - [Update Admin](#update-admin)
  - [Delete Admin](#delete-admin)
- [Hotel API](#hotel-api)
  - [Create Hotel](#create-hotel)
  - [Get All Hotels](#get-all-hotels)
  - [Get Hotel Details](#get-hotel-details)
  - [Update Hotel](#update-hotel)
  - [Delete Hotel](#delete-hotel)
  - [Get Hotel Rooms](#get-hotel-rooms)
- [Room API](#room-api)
  - [Create Room](#create-room-1)
  - [Get All Rooms for a Hotel](#get-all-rooms-for-a-hotel)
  - [Get Room Details](#get-room-details-1)
  - [Update Room](#update-room)
  - [Update Room Status](#update-room-status)
  - [Delete Room](#delete-room-1)
- [Booking API](#booking-api)
  - [Create Booking](#create-booking-1)
  - [Get User Bookings](#get-user-bookings-1)
  - [Get Booking Details](#get-booking-details-1)
  - [Cancel Booking](#cancel-booking)
  - [Get All Bookings (Admin)](#get-all-bookings-admin-1)
  - [Update Booking (Admin)](#update-booking-admin)
  - [Update Booking Status (Admin)](#update-booking-status-admin)
- [Payment API](#payment-api)
  - [Create Payment Intent](#create-payment-intent)
  - [Handle Stripe Webhook](#handle-stripe-webhook)
  - [Get Payment History](#get-payment-history-1)
  - [Get Payment Details](#get-payment-details-1)
- [Profile API](#profile-api)
  - [Get Profile](#get-profile-1)
  - [Update Profile](#update-profile-1)
  - [Change Password](#change-password-1)
- [Review API](#review-api)
  - [Get Room Reviews](#get-room-reviews-1)
  - [Create Review](#create-review-1)
  - [Update Review](#update-review)
  - [Delete Review](#delete-review-1)
- [Stay API](#stay-api)
  - [Get All Stays (Admin)](#get-all-stays-admin-1)
  - [Update Stay Status (Admin)](#update-stay-status-admin)
- [Dashboard API](#dashboard-api)
  - [Get Statistics](#get-statistics-1)

## Schemas
### LoginDto


## Authentication

### Login
**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate a user and get JWT token

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "role": "user",
      "createdAt": "2024-03-20T10:00:00Z",
      "updatedAt": "2024-03-20T10:00:00Z"
    }
  }
}
```

**Error Response (401):**
```json
{
  "status": "error",
  "message": "Invalid credentials"
}
```

### Register
**Endpoint:** `POST /api/auth/register`

**Description:** Register a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "role": "user",
      "createdAt": "2024-03-20T10:00:00Z",
      "updatedAt": "2024-03-20T10:00:00Z"
    }
  }
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

## Profile Management

### Get Profile
**Endpoint:** `GET /api/profile`

**Description:** Get the authenticated user's profile

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user",
    "createdAt": "2024-03-20T10:00:00Z",
    "updatedAt": "2024-03-20T10:00:00Z"
  }
}
```

**Error Response (401):**
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

### Update Profile
**Endpoint:** `PUT /api/profile`

**Description:** Update the authenticated user's profile

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "John Smith",
    "email": "john.smith@example.com",
    "role": "user",
    "createdAt": "2024-03-20T10:00:00Z",
    "updatedAt": "2024-03-20T11:00:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Change Password
**Endpoint:** `POST /api/profile/change-password`

**Description:** Change the authenticated user's password

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Password changed successfully"
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "Current password is incorrect"
}
```

## Admin Management

### Get All Admin Users
**Endpoint:** `GET /api/admin/users`

**Description:** Get all admin users (admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "createdAt": "2024-03-20T10:00:00Z",
      "updatedAt": "2024-03-20T10:00:00Z"
    }
  ]
}
```

### Create Admin User
**Endpoint:** `POST /api/admin/users`

**Description:** Create a new admin user (admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "New Admin",
  "email": "new.admin@example.com",
  "password": "adminpassword123"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": 2,
    "name": "New Admin",
    "email": "new.admin@example.com",
    "role": "admin",
    "createdAt": "2024-03-20T12:00:00Z",
    "updatedAt": "2024-03-20T12:00:00Z"
  }
}
```

### Update Admin User
**Endpoint:** `PUT /api/admin/users/{id}`

**Description:** Update an existing admin user (admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Admin",
  "email": "updated.admin@example.com"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 2,
    "name": "Updated Admin",
    "email": "updated.admin@example.com",
    "role": "admin",
    "createdAt": "2024-03-20T12:00:00Z",
    "updatedAt": "2024-03-20T13:00:00Z"
  }
}
```

### Delete Admin User
**Endpoint:** `DELETE /api/admin/users/{id}`

**Description:** Delete an admin user (admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Admin user deleted successfully"
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "Cannot delete the last admin user"
}
```

## Dashboard

### Get Statistics
**Endpoint:** `GET /api/dashboard`

**Description:** Get dashboard statistics (admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "bookingsByType": [
      {
        "status": "confirmed",
        "count": 10
      },
      {
        "status": "pending",
        "count": 5
      }
    ],
    "totalBookings": 15,
    "totalRevenue": 5000.00,
    "staysByStatus": [
      {
        "status": "active",
        "count": 8
      },
      {
        "status": "completed",
        "count": 7
      }
    ],
    "roomsByStatus": [
      {
        "status": "available",
        "count": 20
      },
      {
        "status": "occupied",
        "count": 10
      }
    ]
  }
}
```

## Payments

### Get Payment History
**Endpoint:** `GET /api/payments`

**Description:** Get paginated payment history

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "payments": [
      {
        "id": 1,
        "amount": 100.00,
        "status": "completed",
        "createdAt": "2024-03-20T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

### Get Payment Details
**Endpoint:** `GET /api/payments/{id}`

**Description:** Get details of a specific payment

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "amount": 100.00,
    "status": "completed",
    "createdAt": "2024-03-20T10:00:00Z"
  }
}
```

## Rooms

### Get All Rooms
**Endpoint:** `GET /api/rooms`

**Description:** Get all available rooms

**Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "roomNumber": "101",
      "type": "standard",
      "price": 100.00,
      "status": "available",
      "createdAt": "2024-03-20T10:00:00Z",
      "updatedAt": "2024-03-20T10:00:00Z"
    }
  ]
}
```

### Get Room Details
**Endpoint:** `GET /api/rooms/{id}`

**Description:** Get details of a specific room

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "roomNumber": "101",
    "type": "standard",
    "price": 100.00,
    "status": "available",
    "createdAt": "2024-03-20T10:00:00Z",
    "updatedAt": "2024-03-20T10:00:00Z"
  }
}
```

### Create Room
**Endpoint:** `POST /api/rooms`

**Description:** Create a new room (admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "roomNumber": "101",
  "type": "standard",
  "price": 100.00,
  "status": "available"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "roomNumber": "101",
    "type": "standard",
    "price": 100.00,
    "status": "available",
    "createdAt": "2024-03-20T10:00:00Z",
    "updatedAt": "2024-03-20T10:00:00Z"
  }
}
```

### Delete Room
**Endpoint:** `DELETE /api/rooms/{id}`

**Description:** Delete a room (admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Room deleted successfully"
}
```

## Bookings

### Get User Bookings
**Endpoint:** `GET /api/bookings`

**Description:** Get all bookings for the authenticated user

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "roomId": 1,
      "userId": 1,
      "checkIn": "2024-03-25T14:00:00Z",
      "checkOut": "2024-03-27T12:00:00Z",
      "status": "confirmed",
      "createdAt": "2024-03-20T10:00:00Z"
    }
  ]
}
```

### Get Booking Details
**Endpoint:** `GET /api/bookings/{id}`

**Description:** Get details of a specific booking

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "roomId": 1,
    "userId": 1,
    "checkIn": "2024-03-25T14:00:00Z",
    "checkOut": "2024-03-27T12:00:00Z",
    "status": "confirmed",
    "createdAt": "2024-03-20T10:00:00Z"
  }
}
```

### Create Booking
**Endpoint:** `POST /api/bookings/rooms/{roomId}`

**Description:** Create a new booking

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "checkIn": "2024-03-25T14:00:00Z",
  "checkOut": "2024-03-27T12:00:00Z"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "roomId": 1,
    "userId": 1,
    "checkIn": "2024-03-25T14:00:00Z",
    "checkOut": "2024-03-27T12:00:00Z",
    "status": "confirmed",
    "createdAt": "2024-03-20T10:00:00Z"
  }
}
```

### Get All Bookings (Admin)
**Endpoint:** `GET /api/bookings/admin/all`

**Description:** Get all bookings (admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "roomId": 1,
      "userId": 1,
      "checkIn": "2024-03-25T14:00:00Z",
      "checkOut": "2024-03-27T12:00:00Z",
      "status": "confirmed",
      "createdAt": "2024-03-20T10:00:00Z"
    }
  ]
}
```

## Stays

### Get All Stays (Admin)
**Endpoint:** `GET /api/stays`

**Description:** Get all stays (admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "bookingId": 1,
      "checkIn": "2024-03-25T14:00:00Z",
      "checkOut": "2024-03-27T12:00:00Z",
      "status": "active",
      "createdAt": "2024-03-20T10:00:00Z"
    }
  ]
}
```

### Update Stay Status
**Endpoint:** `PATCH /api/stays/{id}/status`

**Description:** Update the status of a stay (admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "completed"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "bookingId": 1,
    "checkIn": "2024-03-25T14:00:00Z",
    "checkOut": "2024-03-27T12:00:00Z",
    "status": "completed",
    "createdAt": "2024-03-20T10:00:00Z",
    "updatedAt": "2024-03-20T11:00:00Z"
  }
}
```

## Reviews

### Get Room Reviews
**Endpoint:** `GET /api/reviews/rooms/{roomId}`

**Description:** Get all reviews for a specific room

**Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "roomId": 1,
      "userId": 1,
      "rating": 5,
      "comment": "Great room!",
      "createdAt": "2024-03-20T10:00:00Z"
    }
  ]
}
```

### Create Review
**Endpoint:** `POST /api/reviews/rooms/{roomId}`

**Description:** Create a new review for a room

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Great room!"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "roomId": 1,
    "userId": 1,
    "rating": 5,
    "comment": "Great room!",
    "createdAt": "2024-03-20T10:00:00Z"
  }
}
```

### Delete Review
**Endpoint:** `DELETE /api/reviews/{id}`

**Description:** Delete a review

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Review deleted successfully"
}
```

## Error Responses

All endpoints may return the following error responses:

**401 Unauthorized:**
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "status": "error",
  "message": "Forbidden"
}
```

**404 Not Found:**
```json
{
  "status": "error",
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "status": "error",
  "message": "Internal server error"
}
``` 