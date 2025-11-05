# 📡 Rozgar360 API Framework

A comprehensive, type-safe API framework built with fetch for React Native.

## 🎯 Features

✅ **Type-Safe** - Full TypeScript support with request/response types  
✅ **Error Handling** - Custom error classes with proper error types  
✅ **Token Management** - Automatic token storage and refresh  
✅ **Base URL Configuration** - Centralized API configuration  
✅ **Request/Response Types** - Complete type definitions for all endpoints  
✅ **Query Parameters** - Automatic URL parameter handling  
✅ **Fetch Only** - No external dependencies (uses native fetch)  

---

## 📁 Structure

```
src/api/
├── client.ts          # API client (fetch-based)
├── errors.ts          # Custom error classes
├── types.ts           # Request/Response type definitions
├── auth.api.ts        # Authentication APIs
├── user.api.ts        # User profile APIs
├── labour.api.ts      # Labour search APIs
├── review.api.ts      # Reviews APIs
├── contact.api.ts     # Contact tracking APIs
└── index.ts           # Central export
```

---

## 🚀 Usage

### Basic Example

```typescript
import { postAuthSendOTP, postAuthVerifyOTP } from '../api';

// Send OTP
const result = await postAuthSendOTP({ phone: '9876543210' });

// Verify OTP
const response = await postAuthVerifyOTP({ 
  phone: '9876543210', 
  otp: '1234' 
});
```

### With Error Handling

```typescript
import { postAuthSendOTP } from '../api';
import { RateLimitError, ValidationError } from '../api/errors';

try {
  const result = await postAuthSendOTP({ phone: '9876543210' });
  console.log('OTP sent:', result.success);
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error('Too many requests');
  } else if (error instanceof ValidationError) {
    console.error('Invalid phone number');
  } else {
    console.error('Network error');
  }
}
```

### With Options

```typescript
import { getLabours } from '../api';

const result = await getLabours(
  { 
    city: 'Indore',
    availableOnly: true,
    page: 1,
    limit: 20
  },
  { timeout: 10000 } // 10 seconds
);
```

---

## 📚 API Functions

### Authentication

```typescript
// Send OTP
postAuthSendOTP(data: SendOTPReq, options?: { timeout?: number }): Promise<SendOTPResp>

// Verify OTP
postAuthVerifyOTP(data: VerifyOTPReq, options?: { timeout?: number }): Promise<VerifyOTPResp>

// Refresh Token
postAuthRefreshToken(data: RefreshTokenReq, options?: { timeout?: number }): Promise<RefreshTokenResp>

// Logout
postAuthLogout(data: LogoutReq, options?: { timeout?: number }): Promise<LogoutResp>
```

### User Profile

```typescript
// Complete Profile
postUsersProfile(data: CompleteProfileReq, options?: { timeout?: number }): Promise<CompleteProfileResp>

// Get Profile
getUsersProfile(options?: { timeout?: number }): Promise<GetProfileResp>

// Update Profile
putUsersProfile(data: UpdateProfileReq, options?: { timeout?: number }): Promise<UpdateProfileResp>

// Toggle Availability
patchUsersAvailability(data: ToggleAvailabilityReq, options?: { timeout?: number }): Promise<ToggleAvailabilityResp>
```

### Labour Search

```typescript
// Search Labours
getLabours(params: SearchLaboursParams, options?: { timeout?: number }): Promise<SearchLaboursResp>

// Get Labour Details
getLaboursById(pathParams: { id: string }, options?: { timeout?: number }): Promise<GetLabourDetailsResp>

// Get Nearby Labours
getLaboursNearby(params: GetNearbyLaboursParams, options?: { timeout?: number }): Promise<GetNearbyLaboursResp>
```

### Reviews

```typescript
// Add Review
postReviews(data: AddReviewReq, options?: { timeout?: number }): Promise<AddReviewResp>

// Get Reviews
getReviewsByUserId(pathParams: { userId: string }, params?: { page?: number; limit?: number }, options?: { timeout?: number }): Promise<GetReviewsResp>

// Delete Review
deleteReviewsById(pathParams: { id: string }, options?: { timeout?: number }): Promise<DeleteReviewResp>
```

### Contacts

```typescript
// Track Contact
postContacts(data: TrackContactReq, options?: { timeout?: number }): Promise<TrackContactResp>

// Get Contact History
getContactsHistory(params?: GetContactHistoryParams, options?: { timeout?: number }): Promise<GetContactHistoryResp>
```

---

## 🔧 Configuration

### Base URL

The API client automatically uses:
- **Development (Android Emulator):** `http://10.0.2.2:3000/api/v1`
- **Production:** `https://api.rozgar360.com/api/v1`

To change, edit `src/api/client.ts`:

```typescript
const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:3000/api/v1' // Android Emulator
  : 'https://api.rozgar360.com/api/v1'; // Production
```

### For Physical Device

Update to your computer's IP:

```typescript
const API_BASE_URL = 'http://192.168.1.X:3000/api/v1';
```

---

## 🛡️ Error Handling

### Error Classes

```typescript
ApiError          // Base error class
NetworkError      // Network failures
ValidationError   // 400 Bad Request
AuthenticationError // 401 Unauthorized
NotFoundError     // 404 Not Found
RateLimitError    // 429 Too Many Requests
ServerError       // 500+ Server errors
```

### Example

```typescript
import { postAuthSendOTP } from '../api';
import { RateLimitError, ValidationError, NetworkError } from '../api/errors';

try {
  await postAuthSendOTP({ phone: '9876543210' });
} catch (error) {
  if (error instanceof RateLimitError) {
    // Handle rate limit
  } else if (error instanceof ValidationError) {
    // Handle validation error
  } else if (error instanceof NetworkError) {
    // Handle network error
  }
}
```

---

## 🔐 Token Management

The API client automatically:
- ✅ Stores tokens in AsyncStorage
- ✅ Adds `Authorization` header to requests
- ✅ Refreshes tokens on 401 errors
- ✅ Clears tokens on logout

**Manual Token Management:**

```typescript
import { api } from '../api';

// Set tokens
await api.setTokens(accessToken, refreshToken);

// Get refresh token
const refreshToken = await api.getRefreshToken();

// Clear tokens
await api.clearTokens();
```

---

## 📝 Type Definitions

All request/response types are defined in `src/api/types.ts`:

```typescript
// Request types
SendOTPReq
VerifyOTPReq
CompleteProfileReq
SearchLaboursParams
AddReviewReq
// ... etc

// Response types
SendOTPResp
VerifyOTPResp
CompleteProfileResp
SearchLaboursResp
AddReviewResp
// ... etc
```

---

## 🎨 Integration with Zustand

The API functions are **separate** from Zustand stores. Stores call API functions:

```typescript
// In store
import { postAuthSendOTP } from '../api';

sendOTP: async (phone: string) => {
  const response = await postAuthSendOTP({ phone });
  // Update state
  set({ phoneNumber: phone });
}
```

---

## ✅ Best Practices

1. **Always use try-catch** for API calls
2. **Handle specific error types** for better UX
3. **Use timeout options** for long-running requests
4. **Check response.success** before using data
5. **Keep API functions separate** from state management

---

## 🧪 Testing

```typescript
// Test API call
import { postAuthSendOTP } from '../api';

const result = await postAuthSendOTP({ phone: '9876543210' });
console.log('Success:', result.success);
```

---

## 📖 Complete Example

```typescript
import React from 'react';
import { View, Button, Alert } from 'react-native';
import { postAuthSendOTP, postAuthVerifyOTP } from '../api';
import { RateLimitError, ValidationError } from '../api/errors';

export const LoginScreen = () => {
  const handleSendOTP = async () => {
    try {
      const result = await postAuthSendOTP({ phone: '9876543210' });
      
      if (result.success) {
        Alert.alert('Success', 'OTP sent successfully');
      }
    } catch (error) {
      if (error instanceof RateLimitError) {
        Alert.alert('Error', 'Too many requests. Please try later.');
      } else if (error instanceof ValidationError) {
        Alert.alert('Error', 'Invalid phone number');
      } else {
        Alert.alert('Error', 'Failed to send OTP');
      }
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const result = await postAuthVerifyOTP({ 
        phone: '9876543210', 
        otp: '1234' 
      });
      
      if (result.success) {
        Alert.alert('Success', 'Logged in successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid OTP');
    }
  };

  return (
    <View>
      <Button title="Send OTP" onPress={handleSendOTP} />
      <Button title="Verify OTP" onPress={handleVerifyOTP} />
    </View>
  );
};
```

---

## 🎉 Summary

**16 API Functions** - All endpoints covered  
**Type-Safe** - Full TypeScript support  
**Error Handling** - Custom error classes  
**Token Management** - Automatic refresh  
**Fetch Only** - No external dependencies  
**Production Ready** - Enterprise-grade  

**Your frontend and backend are now fully integrated!** 🚀

