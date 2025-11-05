# Rozgar360 API Documentation

Complete API reference for Rozgar360 Backend

**Base URL:** `http://localhost:3000/api/v1`

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [User Profile](#user-profile)
3. [Labour Search](#labour-search)
4. [Reviews](#reviews)
5. [Contacts](#contacts)
6. [Error Codes](#error-codes)

---

## 🔐 Authentication

All endpoints marked with 🔒 require authentication.  
Add header: `Authorization: Bearer <access-token>`

---

### 1. Send OTP

**POST** `/auth/send-otp`

Send OTP to phone number for authentication.

**Request Body:**
```json
{
  "phone": "9876543210"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 300
}
```

**Error Responses:**
- `400` - Invalid phone number
- `429` - Too many requests (>3 per hour)
- `500` - Server error

**Rate Limit:** 3 requests per hour per phone

---

### 2. Verify OTP

**POST** `/auth/verify-otp`

Verify OTP and login/signup.

**Request Body:**
```json
{
  "phone": "9876543210",
  "otp": "1234"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "isNewUser": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": null
}
```

**Notes:**
- `isNewUser: true` means profile setup required
- `user: null` for new users
- `user: {...}` for existing users

**Error Responses:**
- `400` - Invalid OTP / Expired OTP
- `500` - Server error

---

### 3. Refresh Token

**POST** `/auth/refresh-token`

Get new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

**Error Responses:**
- `401` - Invalid/Expired refresh token
- `500` - Server error

---

### 4. Logout 🔒

**POST** `/auth/logout`

Logout and revoke refresh token.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 👤 User Profile

### 5. Complete Profile 🔒

**POST** `/users/profile`

Complete profile setup (first time only).

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "address": "Sector 12, Main Road",
  "city": "Indore",
  "state": "Madhya Pradesh",
  "pincode": "452001",
  "bio": "Experienced farmer with 10 years expertise",
  "isAvailable": true,
  "skills": ["farming", "gardening"],
  "experienceYears": 10,
  "labourType": "daily",
  "latitude": 22.7196,
  "longitude": 75.8577
}
```

**Success Response:** `201 Created`
```json
{
  "success": true,
  "message": "Profile completed successfully",
  "user": {
    "id": "uuid",
    "phone": "9876543210",
    "email": "rajesh@example.com",
    "name": "Rajesh Kumar",
    "profilePictureUrl": null,
    "bio": "Experienced farmer...",
    "address": "Sector 12, Main Road",
    "city": "Indore",
    "state": "Madhya Pradesh",
    "pincode": "452001",
    "latitude": 22.7196,
    "longitude": 75.8577,
    "isAvailable": true,
    "skills": ["farming", "gardening"],
    "experienceYears": 10,
    "labourType": "daily",
    "rating": 0,
    "totalReviews": 0,
    "isVerified": false,
    "createdAt": "2025-11-05T...",
    "updatedAt": "2025-11-05T..."
  }
}
```

**Error Responses:**
- `400` - Validation error / Profile already completed
- `401` - Unauthorized
- `500` - Server error

---

### 6. Get Profile 🔒

**GET** `/users/profile`

Get current user's profile.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "phone": "9876543210",
    "name": "Rajesh Kumar",
    ...
  }
}
```

---

### 7. Update Profile 🔒

**PUT** `/users/profile`

Update user profile.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:** (All fields optional)
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "address": "New Address",
  "city": "New City",
  "state": "New State",
  "pincode": "452002",
  "bio": "Updated bio",
  "isAvailable": false,
  "skills": ["farming", "gardening", "plumbing"],
  "experienceYears": 12,
  "labourType": "monthly",
  "latitude": 22.7196,
  "longitude": 75.8577
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

### 8. Toggle Availability 🔒

**PATCH** `/users/availability`

Toggle user's availability status.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "isAvailable": true
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Availability updated successfully",
  "id": "uuid",
  "isAvailable": true
}
```

---

## 🔍 Labour Search

### 9. Search Labours 🔒

**GET** `/labours`

Search and filter labours.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `search` (string) - Search by name, city
- `city` (string) - Filter by city
- `skills` (string) - Comma-separated skills (e.g., "farming,gardening")
- `minExperience` (number) - Minimum experience years
- `maxExperience` (number) - Maximum experience years
- `labourType` (string) - daily, monthly, partTime, fullTime, contract, freelance
- `availableOnly` (boolean) - Show only available labours
- `minRating` (number) - Minimum rating (0-5)
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 20, max: 100)
- `sortBy` (string) - rating, experience, distance (default: rating)

**Example:**
```
GET /labours?city=Indore&skills=farming,gardening&availableOnly=true&page=1&limit=20
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "labours": [
    {
      "id": "uuid",
      "phone": "9876543210",
      "name": "Rajesh Kumar",
      "city": "Indore",
      "skills": ["farming", "gardening"],
      "rating": 4.5,
      "isAvailable": true,
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### 10. Get Labour Details 🔒

**GET** `/labours/:id`

Get detailed information about a specific labour.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "labour": {
    "id": "uuid",
    "phone": "9876543210",
    "name": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "bio": "Experienced farmer...",
    "address": "Sector 12, Main Road",
    "city": "Indore",
    "state": "Madhya Pradesh",
    "pincode": "452001",
    "latitude": 22.7196,
    "longitude": 75.8577,
    "isAvailable": true,
    "skills": ["farming", "gardening"],
    "experienceYears": 10,
    "labourType": "daily",
    "rating": 4.5,
    "totalReviews": 25,
    "isVerified": false
  }
}
```

**Error Responses:**
- `404` - Labour not found
- `500` - Server error

---

### 11. Get Nearby Labours 🔒

**GET** `/labours/nearby`

Get labours near a specific location.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `latitude` (number) **required** - Latitude coordinate
- `longitude` (number) **required** - Longitude coordinate
- `radius` (number) - Search radius in km (default: 10)
- `limit` (number) - Max results (default: 20)

**Example:**
```
GET /labours/nearby?latitude=22.7196&longitude=75.8577&radius=5&limit=10
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "labours": [
    {
      "id": "uuid",
      "name": "Rajesh Kumar",
      "city": "Indore",
      "distance": 2.5,
      "isAvailable": true,
      ...
    }
  ]
}
```

**Note:** Results sorted by distance (nearest first)

---

## ⭐ Reviews

### 12. Add Review 🔒

**POST** `/reviews`

Add or update a review for a labour.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "labourId": "uuid",
  "rating": 5,
  "comment": "Excellent work! Very professional."
}
```

**Success Response:** `201 Created`
```json
{
  "success": true,
  "message": "Review added successfully",
  "review": {
    "id": "uuid",
    "reviewerId": "uuid",
    "revieweeId": "uuid",
    "rating": 5,
    "comment": "Excellent work!",
    "createdAt": "2025-11-05T...",
    "reviewer": {
      "id": "uuid",
      "name": "John Doe",
      "profilePictureUrl": null
    }
  }
}
```

**Notes:**
- One review per user pair
- Updates existing review if already exists
- Automatically updates labour's average rating

**Error Responses:**
- `400` - Validation error / Cannot review yourself
- `404` - Labour not found
- `500` - Server error

---

### 13. Get Reviews 🔒

**GET** `/reviews/:userId`

Get all reviews for a specific user.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 20)

**Example:**
```
GET /reviews/uuid-here?page=1&limit=10
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "reviews": [
    {
      "id": "uuid",
      "rating": 5,
      "comment": "Excellent work!",
      "createdAt": "2025-11-05T...",
      "reviewer": {
        "id": "uuid",
        "name": "John Doe",
        "profilePictureUrl": null
      }
    }
  ],
  "averageRating": 4.5,
  "totalReviews": 25,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### 14. Delete Review 🔒

**DELETE** `/reviews/:id`

Delete your own review.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

**Error Responses:**
- `400` - Can only delete your own reviews
- `404` - Review not found
- `500` - Server error

---

## 📞 Contacts

### 15. Track Contact 🔒

**POST** `/contacts`

Track when a user contacts a labour.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "labourId": "uuid",
  "contactType": "call"
}
```

**Contact Types:**
- `call` - Phone call
- `message` - SMS/Message

**Success Response:** `201 Created`
```json
{
  "success": true,
  "message": "Contact tracked successfully",
  "contact": {
    "id": "uuid",
    "fromUserId": "uuid",
    "toUserId": "uuid",
    "type": "call",
    "createdAt": "2025-11-05T..."
  }
}
```

---

### 16. Get Contact History 🔒

**GET** `/contacts/history`

Get contact history.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `type` (string) - sent | received (optional)
- `page` (number) - Page number
- `limit` (number) - Items per page

**Example:**
```
GET /contacts/history?type=sent&page=1&limit=20
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "contacts": [
    {
      "id": "uuid",
      "type": "call",
      "createdAt": "2025-11-05T...",
      "fromUser": {
        "id": "uuid",
        "name": "John Doe",
        "phone": "9876543210"
      },
      "toUser": {
        "id": "uuid",
        "name": "Rajesh Kumar",
        "phone": "8765432109"
      }
    }
  ],
  "pagination": { ... }
}
```

---

## 📊 Complete API List

### Authentication (No Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/send-otp` | Send OTP |
| POST | `/auth/verify-otp` | Verify OTP & Login |
| POST | `/auth/refresh-token` | Refresh access token |

### Authentication (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/logout` | Logout user |

### User Profile (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/profile` | Complete profile |
| GET | `/users/profile` | Get own profile |
| PUT | `/users/profile` | Update profile |
| PATCH | `/users/availability` | Toggle availability |

### Labour Search (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/labours` | Search & filter labours |
| GET | `/labours/nearby` | Get nearby labours |
| GET | `/labours/:id` | Get labour details |

### Reviews (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reviews` | Add review |
| GET | `/reviews/:userId` | Get user reviews |
| DELETE | `/reviews/:id` | Delete own review |

### Contacts (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/contacts` | Track contact |
| GET | `/contacts/history` | Get contact history |

---

## 🔴 Error Codes

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Invalid/missing token |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal error |

### Error Response Format

```json
{
  "success": false,
  "message": "Error description"
}
```

**Validation errors include details:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "phone",
      "message": "Phone number must be 10 digits"
    }
  ]
}
```

---

## 🧪 Testing Examples

### Complete User Journey

#### Step 1: Send OTP
```bash
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'
```

#### Step 2: Verify OTP (check console for OTP)
```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","otp":"1234"}'

# Save the accessToken
```

#### Step 3: Complete Profile
```bash
curl -X POST http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "address": "Sector 12",
    "city": "Indore",
    "state": "Madhya Pradesh",
    "pincode": "452001",
    "bio": "Experienced farmer",
    "isAvailable": true,
    "skills": ["farming", "gardening"],
    "experienceYears": 10,
    "labourType": "daily"
  }'
```

#### Step 4: Search Labours
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/v1/labours?city=Indore&availableOnly=true"
```

#### Step 5: Add Review
```bash
curl -X POST http://localhost:3000/api/v1/reviews \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "labourId": "LABOUR_UUID",
    "rating": 5,
    "comment": "Excellent work!"
  }'
```

---

## 📱 Integration with Mobile App

### API Client Setup

**Install axios in frontend:**
```bash
cd frontend
npm install axios
```

**Create API client:**
```typescript
// frontend/src/utils/api.ts
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = 'http://10.0.2.2:3000/api/v1'; // Android emulator
// const API_BASE_URL = 'http://192.168.1.X:3000/api/v1'; // Physical device

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - refresh it
      const refreshToken = useAuthStore.getState().refreshToken;
      // ... refresh logic
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🔒 Security

### JWT Tokens

**Access Token:**
- Expires: 15 minutes
- Used for API requests
- Include in `Authorization` header

**Refresh Token:**
- Expires: 30 days
- Used to get new access token
- Stored in database
- Revoked on logout

### Rate Limiting

- General API: 100 requests / 15 minutes
- OTP Requests: 3 requests / hour per phone

---

## 📝 Notes

### Pagination
- Default page size: 20
- Maximum page size: 100
- Page numbers start at 1

### Skills
Valid skills:
- farming, carWashing, carDriving, makeup, painting
- plumbing, electrical, carpentry, cooking, cleaning
- gardening, construction, welding, tailoring, beautician

### Labour Types
Valid types:
- daily, monthly, partTime, fullTime, contract, freelance

---

## 🎯 API Versioning

Current version: **v1**

All endpoints prefixed with `/api/v1/`

---

## 📚 Additional Resources

- **Postman Collection:** Import endpoints for testing
- **Swagger/OpenAPI:** Coming soon
- **WebSocket API:** Coming soon (for real-time features)

---

**Last Updated:** November 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

