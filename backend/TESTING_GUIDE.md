# 🧪 Rozgar360 Backend - Testing Guide

Complete guide for testing all 16 API endpoints

---

## 🚀 Quick Start

### Prerequisites
- Server running on port 3000
- `jq` installed (for JSON formatting)
- `curl` installed

### Run All Tests
```bash
cd backend
./test-api.sh
```

### Run with Custom Phone Number
```bash
./test-api.sh 9876543210
```

---

## 📋 Test Script Features

### ✅ What It Tests

**18 Comprehensive Tests:**

1. ✅ Server Health Check
2. ✅ Send OTP (with rate limit handling)
3. ✅ Send OTP - Invalid Phone (validation test)
4. ✅ Verify OTP
5. ✅ Complete Profile
6. ✅ Get Profile
7. ✅ Update Profile
8. ✅ Toggle Availability
9. ✅ Search Labours
10. ✅ Get Labour Details
11. ✅ Get Nearby Labours
12. ✅ Add Review
13. ✅ Get Reviews
14. ✅ Track Contact
15. ✅ Get Contact History
16. ✅ Refresh Token
17. ✅ Logout
18. ✅ Unauthorized Access Test

### 🎨 Features

- **Color-coded output** (green ✅, red ❌, yellow ℹ️, blue 🔵)
- **Automatic phone number generation** (avoids rate limits)
- **Smart error handling** (detects rate limits, validation errors)
- **Token management** (stores and reuses tokens)
- **Sequential testing** (tests build on each other)
- **Comprehensive coverage** (all 16 endpoints)

---

## 🔧 Manual Testing

### 1. Health Check
```bash
curl http://localhost:3000/api/v1/health | jq '.'
```

### 2. Send OTP
```bash
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}' | jq '.'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 299
}
```

**Rate Limit Response (429):**
```json
{
  "success": false,
  "message": "Too many OTP requests. Please try after 1 hour.",
  "expiresIn": 0
}
```

### 3. Verify OTP
```bash
# Check server console for OTP, then:
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","otp":"1234"}' | jq '.'
```

**Expected Response:**
```json
{
  "success": true,
  "isNewUser": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": null
}
```

### 4. Complete Profile
```bash
TOKEN="your-access-token-here"

curl -X POST http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "address": "123 Test Street",
    "city": "Indore",
    "state": "Madhya Pradesh",
    "pincode": "452001",
    "bio": "Test bio",
    "isAvailable": true,
    "skills": ["farming", "gardening"],
    "experienceYears": 5,
    "labourType": "daily"
  }' | jq '.'
```

### 5. Get Profile
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/users/profile | jq '.'
```

### 6. Search Labours
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/labours?city=Indore&availableOnly=true" | jq '.'
```

### 7. Add Review
```bash
curl -X POST http://localhost:3000/api/v1/reviews \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "labourId": "uuid-here",
    "rating": 5,
    "comment": "Excellent work!"
  }' | jq '.'
```

---

## 🐛 Troubleshooting

### Issue: Rate Limit Exceeded

**Problem:** `429 Too Many Requests`

**Solution:**
1. Use a different phone number
2. Wait 1 hour
3. Clear old OTPs:
   ```bash
   ./clear-otps.sh [phone-number]
   ```

### Issue: Server Not Running

**Problem:** `Connection refused`

**Solution:**
```bash
cd backend
npm run dev
```

### Issue: Invalid Token

**Problem:** `401 Unauthorized`

**Solution:**
1. Re-run OTP verification to get new token
2. Check token format: `Bearer <token>`
3. Token may have expired (15 minutes)

### Issue: Validation Error

**Problem:** `400 Bad Request`

**Solution:**
- Check request body format
- Verify all required fields are present
- Check field types (phone must be 10 digits, etc.)

---

## 📊 Expected Status Codes

| Endpoint | Success | Rate Limit | Validation Error | Auth Error |
|----------|---------|------------|------------------|------------|
| Send OTP | 200 | 429 | 400 | - |
| Verify OTP | 200 | - | 400 | - |
| Refresh Token | 200 | - | 400 | 401 |
| Logout | 200 | - | 400 | 401 |
| Complete Profile | 201 | - | 400 | 401 |
| Get Profile | 200 | - | - | 401 |
| Update Profile | 200 | - | 400 | 401 |
| Toggle Availability | 200 | - | 400 | 401 |
| Search Labours | 200 | - | - | 401 |
| Get Labour Details | 200 | - | - | 401 |
| Get Nearby Labours | 200 | - | 400 | 401 |
| Add Review | 201 | - | 400 | 401 |
| Get Reviews | 200 | - | - | 401 |
| Delete Review | 200 | - | 400 | 401 |
| Track Contact | 201 | - | 400 | 401 |
| Get Contact History | 200 | - | - | 401 |

---

## 🔍 Testing Individual Endpoints

### Authentication Tests

```bash
# Test 1: Health Check
curl http://localhost:3000/api/v1/health

# Test 2: Send OTP
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9998887776"}'

# Test 3: Invalid Phone (should fail)
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"123"}'

# Test 4: Verify OTP (get OTP from console)
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9998887776","otp":"YOUR_OTP"}'
```

### Profile Tests

```bash
TOKEN="your-token-here"

# Complete Profile
curl -X POST http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @profile.json

# Get Profile
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/users/profile

# Update Profile
curl -X PUT http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bio":"Updated bio"}'
```

### Search Tests

```bash
# Search with filters
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/labours?city=Indore&skills=farming&availableOnly=true"

# Get nearby
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/labours/nearby?latitude=22.7196&longitude=75.8577&radius=10"
```

---

## 🧹 Helper Scripts

### Clear Old OTPs
```bash
# Clear all OTPs older than 1 hour
./clear-otps.sh

# Clear OTPs for specific phone
./clear-otps.sh 9876543210
```

### View Database
```bash
# Open Prisma Studio
npm run prisma:studio

# View logs
tail -f logs/combined.log
```

---

## ✅ Test Checklist

### Pre-Testing
- [ ] Server is running (`npm run dev`)
- [ ] Database is connected
- [ ] Environment variables set
- [ ] `jq` installed

### Authentication Flow
- [ ] Health check works
- [ ] Send OTP works (new phone)
- [ ] Send OTP fails (invalid phone)
- [ ] Rate limit works (429 after 3 requests)
- [ ] Verify OTP works
- [ ] Tokens received

### Profile Flow
- [ ] Complete profile works
- [ ] Get profile works
- [ ] Update profile works
- [ ] Toggle availability works

### Search Flow
- [ ] Search labours works
- [ ] Filters work (city, skills, etc.)
- [ ] Get labour details works
- [ ] Nearby search works

### Reviews Flow
- [ ] Add review works
- [ ] Get reviews works
- [ ] Delete review works

### Contacts Flow
- [ ] Track contact works
- [ ] Get contact history works

### Security
- [ ] Unauthorized access blocked (401)
- [ ] Invalid tokens rejected
- [ ] Rate limiting works

---

## 📈 Performance Testing

### Load Test
```bash
# Test 100 requests
for i in {1..100}; do
  curl -s http://localhost:3000/api/v1/health > /dev/null
done
```

### Concurrent Requests
```bash
# 10 concurrent requests
for i in {1..10}; do
  curl -s http://localhost:3000/api/v1/health &
done
wait
```

---

## 🎯 Best Practices

1. **Use Random Phone Numbers** - Avoid rate limits
2. **Save Tokens** - Reuse for multiple tests
3. **Check Logs** - Monitor server console
4. **Test Error Cases** - Invalid inputs, missing fields
5. **Verify Status Codes** - Ensure correct responses
6. **Clean Up** - Clear test data after testing

---

## 📝 Test Results Template

```
Test Run: [Date]
Phone Number: [Number]
Status: [Pass/Fail]

✅ Authentication: Pass
✅ Profile: Pass
✅ Search: Pass
✅ Reviews: Pass
✅ Contacts: Pass
✅ Security: Pass

Total: 18/18 tests passed
```

---

## 🆘 Support

**Issues?**
1. Check server logs: `tail -f logs/combined.log`
2. Check database: `npm run prisma:studio`
3. Verify environment: `.env` file
4. Check TypeScript: `npx tsc --noEmit`

**All tests passing?** ✅ Your backend is production-ready!

---

**Happy Testing!** 🎉

