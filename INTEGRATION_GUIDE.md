# 🔗 Frontend-Backend Integration Guide

Complete guide to connect your React Native app with the backend API

---

## 📦 What's Ready

### Backend ✅
- 16 API endpoints running on `http://localhost:3000`
- Authentication with JWT
- All features implemented
- Production-ready

### Frontend ✅
- React Native app with Zustand
- All screens built
- Hardcoded data currently
- Ready for API integration

---

## 🚀 Integration Steps

### Step 1: Install Dependencies in Frontend

```bash
cd frontend
npm install axios
```

---

### Step 2: Create API Client

Create `frontend/src/utils/api.ts`:

```typescript
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// For Android Emulator
const API_BASE_URL = 'http://10.0.2.2:3000/api/v1';

// For Physical Device (replace with your computer's IP)
// const API_BASE_URL = 'http://192.168.1.X:3000/api/v1';

// For iOS Simulator
// const API_BASE_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();
        
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken }
        );

        // Update tokens
        useAuthStore.getState().setTokens(
          data.accessToken,
          data.refreshToken
        );

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

### Step 3: Update Auth Store

Update `frontend/src/stores/authStore.ts`:

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '../utils/storage';
import api from '../utils/api';

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string;
  refreshToken: string;
  phoneNumber: string;
  
  // Actions
  sendOTP: (phone: string) => Promise<boolean>;
  verifyOTP: (phone: string, otp: string) => Promise<boolean>;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      accessToken: '',
      refreshToken: '',
      phoneNumber: '',

      sendOTP: async (phone: string) => {
        try {
          const { data } = await api.post('/auth/send-otp', { phone });
          set({ phoneNumber: phone });
          return data.success;
        } catch (error) {
          console.error('Send OTP error:', error);
          return false;
        }
      },

      verifyOTP: async (phone: string, otp: string) => {
        try {
          const { data } = await api.post('/auth/verify-otp', { phone, otp });
          
          if (data.success) {
            set({
              isAuthenticated: true,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              phoneNumber: phone,
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Verify OTP error:', error);
          return false;
        }
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },

      logout: async () => {
        try {
          const { refreshToken } = get();
          await api.post('/auth/logout', { refreshToken });
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            isAuthenticated: false,
            accessToken: '',
            refreshToken: '',
            phoneNumber: '',
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
```

---

### Step 4: Update User Store

Update `frontend/src/stores/userStore.ts`:

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../types';
import { zustandStorage } from '../utils/storage';
import api from '../utils/api';

interface UserState {
  currentUser: User | null;
  hasCompletedProfile: boolean;
  
  // Actions
  completeProfile: (profileData: any) => Promise<boolean>;
  updateProfile: (updates: any) => Promise<boolean>;
  fetchProfile: () => Promise<void>;
  toggleAvailability: () => Promise<void>;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      hasCompletedProfile: false,

      completeProfile: async (profileData) => {
        try {
          const { data } = await api.post('/users/profile', profileData);
          
          if (data.success) {
            set({
              currentUser: data.user,
              hasCompletedProfile: true,
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Complete profile error:', error);
          return false;
        }
      },

      updateProfile: async (updates) => {
        try {
          const { data } = await api.put('/users/profile', updates);
          
          if (data.success) {
            set({ currentUser: data.user });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Update profile error:', error);
          return false;
        }
      },

      fetchProfile: async () => {
        try {
          const { data } = await api.get('/users/profile');
          
          if (data.success && data.user) {
            set({
              currentUser: data.user,
              hasCompletedProfile: true,
            });
          }
        } catch (error) {
          console.error('Fetch profile error:', error);
        }
      },

      toggleAvailability: async () => {
        try {
          const currentUser = get().currentUser;
          if (!currentUser) return;

          const newStatus = !currentUser.isAvailable;
          
          const { data } = await api.patch('/users/availability', {
            isAvailable: newStatus,
          });

          if (data.success) {
            set({
              currentUser: {
                ...currentUser,
                isAvailable: data.isAvailable,
              },
            });
          }
        } catch (error) {
          console.error('Toggle availability error:', error);
        }
      },

      clearUser: () => set({ currentUser: null, hasCompletedProfile: false }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
```

---

### Step 5: Update Labour Store

Update `frontend/src/stores/labourStore.ts`:

```typescript
import { create } from 'zustand';
import { Labour, FilterOptions } from '../types';
import api from '../utils/api';

interface LabourState {
  labours: Labour[];
  filteredLabours: Labour[];
  filters: FilterOptions;
  searchQuery: string;
  loading: boolean;
  
  // Actions
  fetchLabours: () => Promise<void>;
  searchLabours: (filters: FilterOptions) => Promise<void>;
  getLabourById: (id: string) => Promise<Labour | null>;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

const defaultFilters: FilterOptions = {
  skills: [],
  experienceRange: { min: 0, max: 50 },
  labourTypes: [],
  distance: 50,
  availableOnly: false,
  minRating: 0,
};

export const useLabourStore = create<LabourState>((set, get) => ({
  labours: [],
  filteredLabours: [],
  filters: defaultFilters,
  searchQuery: '',
  loading: false,

  fetchLabours: async () => {
    try {
      set({ loading: true });
      
      const { data } = await api.get('/labours', {
        params: {
          availableOnly: true,
          page: 1,
          limit: 50,
        },
      });

      if (data.success) {
        set({
          labours: data.labours,
          filteredLabours: data.labours,
        });
      }
    } catch (error) {
      console.error('Fetch labours error:', error);
    } finally {
      set({ loading: false });
    }
  },

  searchLabours: async (filters) => {
    try {
      set({ loading: true, filters });
      
      const { data } = await api.get('/labours', {
        params: {
          skills: filters.skills.join(','),
          minExperience: filters.experienceRange.min,
          maxExperience: filters.experienceRange.max,
          labourType: filters.labourTypes.join(','),
          availableOnly: filters.availableOnly,
          minRating: filters.minRating,
        },
      });

      if (data.success) {
        set({ filteredLabours: data.labours });
      }
    } catch (error) {
      console.error('Search labours error:', error);
    } finally {
      set({ loading: false });
    }
  },

  getLabourById: async (id: string) => {
    try {
      const { data } = await api.get(`/labours/${id}`);
      return data.success ? data.labour : null;
    } catch (error) {
      console.error('Get labour error:', error);
      return null;
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    // Implement local filtering or API search
  },

  resetFilters: () => set({ filters: defaultFilters }),
}));
```

---

### Step 6: Update Screens

#### Login Screen

Update `frontend/src/screens/onboarding/LoginScreen.tsx`:

```typescript
const handleSendOTP = async () => {
  const error = validatePhone(phone);
  setPhoneError(error);

  if (!error) {
    setLoading(true);
    const success = await sendOTP(phone); // Use store action
    setLoading(false);

    if (success) {
      navigation.navigate('OTP');
    } else {
      setPhoneError('Failed to send OTP. Please try again.');
    }
  }
};
```

#### OTP Screen

Update `frontend/src/screens/onboarding/OTPScreen.tsx`:

```typescript
const handleVerifyOTP = async () => {
  const otpValue = otp.join('');
  
  if (otpValue.length !== 4) {
    setError('Please enter complete OTP');
    return;
  }

  setLoading(true);
  const success = await verifyOTP(phoneNumber, otpValue); // Use store action
  setLoading(false);

  if (success) {
    navigation.replace('ProfileSetup');
  } else {
    setError('Invalid OTP');
    setOtp(['', '', '', '']);
  }
};
```

#### Profile Setup Screen

Update `frontend/src/screens/onboarding/ProfileSetupScreen.tsx`:

```typescript
const handleSubmit = async () => {
  if (validate()) {
    const profileData = {
      name,
      email,
      address,
      city,
      state,
      pincode,
      bio,
      isAvailable,
      skills: selectedSkills,
      experienceYears: parseInt(experience, 10),
      labourType: selectedLabourType,
    };

    const success = await completeProfile(profileData); // Use store action

    if (success) {
      navigation.replace('Main');
    } else {
      // Show error
      Alert.alert('Error', 'Failed to complete profile');
    }
  }
};
```

#### Home Screen

Update `frontend/src/screens/main/HomeScreen.tsx`:

```typescript
// Add useEffect to fetch labours
React.useEffect(() => {
  fetchLabours(); // Fetch from API
}, []);
```

---

## 🔧 Configuration

### Find Your Computer's IP Address

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

### Update API Base URL

**For Android Emulator:**
```typescript
const API_BASE_URL = 'http://10.0.2.2:3000/api/v1';
```

**For Physical Device (Same WiFi):**
```typescript
// Replace X.X.X.X with your computer's IP
const API_BASE_URL = 'http://192.168.1.X:3000/api/v1';
```

**For iOS Simulator:**
```typescript
const API_BASE_URL = 'http://localhost:3000/api/v1';
```

---

## 🧪 Testing Integration

### Test 1: Authentication Flow

1. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start frontend:**
   ```bash
   cd frontend
   npm start
   npm run android
   ```

3. **Test flow:**
   - Enter phone: 9876543210
   - Check backend console for OTP
   - Enter OTP
   - Should receive tokens ✅

### Test 2: Profile Setup

1. Complete profile in app
2. Check backend database:
   ```bash
   cd backend
   npm run prisma:studio
   ```
3. See user record created ✅

### Test 3: Labour Search

1. Search for labours in app
2. Should fetch from backend ✅
3. Check network tab in React Native Debugger

---

## 🔍 Debugging

### Enable React Native Debugger

```bash
# In frontend terminal
npm start

# Press 'j' to open debugger
# Open Chrome DevTools → Network tab
```

### Check API Calls

```typescript
// Add logging to API client
api.interceptors.request.use((config) => {
  console.log('API Request:', config.method, config.url, config.data);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data);
    return Promise.reject(error);
  }
);
```

---

## ⚡ Quick Start

### 1. Start Backend
```bash
cd backend
npm run dev
```

**Should see:**
```
✅ Database connected
🚀 Server running on port 3000
```

### 2. Update Frontend API URL
```typescript
// frontend/src/utils/api.ts
const API_BASE_URL = 'http://10.0.2.2:3000/api/v1';
```

### 3. Start Frontend
```bash
cd frontend
npm start
npm run android
```

### 4. Test Login
- Enter phone number
- Check backend console for OTP
- Enter OTP
- Should login successfully! ✅

---

## 🎯 Integration Checklist

### Backend
- [x] Server running on port 3000
- [x] Database connected
- [x] All 16 endpoints working
- [x] CORS enabled for mobile app
- [x] Logging enabled

### Frontend
- [ ] Install axios
- [ ] Create api.ts client
- [ ] Update authStore to use API
- [ ] Update userStore to use API
- [ ] Update labourStore to use API
- [ ] Test authentication flow
- [ ] Test profile flow
- [ ] Test search flow

---

## 📱 Mobile App Changes Needed

### Files to Update:

1. ✅ `frontend/src/utils/api.ts` - Create this (API client)
2. ✅ `frontend/src/stores/authStore.ts` - Replace hardcoded logic
3. ✅ `frontend/src/stores/userStore.ts` - Add API calls
4. ✅ `frontend/src/stores/labourStore.ts` - Fetch from backend
5. ✅ `frontend/src/screens/onboarding/LoginScreen.tsx` - Use store actions
6. ✅ `frontend/src/screens/onboarding/OTPScreen.tsx` - Use store actions
7. ✅ `frontend/src/screens/onboarding/ProfileSetupScreen.tsx` - Use store actions
8. ✅ `frontend/src/screens/main/HomeScreen.tsx` - Fetch data

---

## 🔐 Security Notes

### Storing Tokens

**Current (AsyncStorage):** ✅ OK for development

**Production:** Consider using:
- `react-native-keychain` for secure token storage
- Biometric authentication
- Token encryption

### Network Security

**Development:** HTTP is fine

**Production:** Use HTTPS
- Get SSL certificate
- Configure reverse proxy (Nginx)
- Update API_BASE_URL to https://

---

## 🐛 Common Issues

### Issue 1: Connection Refused

**Symptoms:** "Network request failed"

**Solutions:**
1. Check backend is running
2. Verify API_BASE_URL
3. Check firewall settings
4. Use computer's IP (not localhost)

### Issue 2: Unauthorized (401)

**Symptoms:** "Invalid token"

**Solutions:**
1. Check token is being sent
2. Verify token in request headers
3. Check token expiry
4. Implement token refresh

### Issue 3: CORS Error

**Symptoms:** "CORS policy blocked"

**Solution:** Update backend `.env`:
```env
CORS_ORIGIN=http://localhost:3000,*
```

---

## ✅ Final Integration Test

### Complete User Journey:

1. **Login** → Send OTP → Verify → Get tokens ✅
2. **Profile Setup** → POST /users/profile → Profile created ✅
3. **Home Screen** → GET /labours → List displayed ✅
4. **Search** → GET /labours?search=... → Filtered results ✅
5. **Labour Details** → GET /labours/:id → Details shown ✅
6. **Contact** → POST /contacts → Tracked ✅
7. **Review** → POST /reviews → Review added ✅
8. **Update Profile** → PUT /users/profile → Updated ✅
9. **Toggle Availability** → PATCH /users/availability → Updated ✅
10. **Logout** → POST /auth/logout → Logged out ✅

---

## 🎉 You're Ready!

### Backend ✅
- 16 endpoints running
- All tested and working
- Production-ready

### Frontend ✅
- All screens built
- State management ready
- Just needs API integration

### Integration ✅
- API client template provided
- Store updates documented
- Testing guide included

---

**Next Steps:**
1. Create `frontend/src/utils/api.ts`
2. Update auth store
3. Test login flow
4. Gradually replace hardcoded data

**Your Rozgar360 app will be fully functional!** 🚀

---

**Questions?**
- Check `API_DOCUMENTATION.md` for endpoint details
- Check `BACKEND_COMPLETE.md` for backend overview
- Check backend logs for debugging

**Happy integrating! 🎊**

