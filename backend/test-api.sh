#!/bin/bash

# Rozgar360 Backend API Comprehensive Test Script
# Tests all 16 API endpoints

BASE_URL="http://localhost:3000/api/v1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print test header
print_test() {
    echo ""
    echo -e "${BLUE}$1${NC}"
    echo "----------------------------------------"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to print info
print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Allow custom phone number or generate random
if [ -z "$1" ]; then
    # Generate random phone number for testing (to avoid rate limits)
    TEST_PHONE="9$(shuf -i 100000000-999999999 -n 1)"
    print_info "Using random phone number: $TEST_PHONE"
else
    TEST_PHONE="$1"
    print_info "Using provided phone number: $TEST_PHONE"
fi

TEST_OTP=""
ACCESS_TOKEN=""
REFRESH_TOKEN=""
USER_ID=""
LABOUR_ID=""
REVIEW_ID=""

# Function to check if server is running
check_server() {
    print_test "🔍 Checking Server Status"
    RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/health" 2>&1)
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
        print_success "Server is running"
        return 0
    else
        print_error "Server is not running (HTTP $HTTP_CODE)"
        print_info "Please start the server: cd backend && npm run dev"
        exit 1
    fi
}

# Test 1: Health Check
test_health() {
    print_test "1️⃣  Health Check"
    RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "Health check passed"
    else
        print_error "Health check failed (HTTP $HTTP_CODE)"
    fi
}

# Test 2: Send OTP
test_send_otp() {
    print_test "2️⃣  Send OTP"
    print_info "Phone: $TEST_PHONE"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/send-otp" \
        -H "Content-Type: application/json" \
        -d "{\"phone\":\"$TEST_PHONE\"}")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "OTP sent successfully"
        print_info "Check server console for OTP code"
        return 0
    elif [ "$HTTP_CODE" = "429" ]; then
        print_error "Rate limit exceeded (HTTP 429)"
        print_info "This phone number has reached the limit (3 OTPs/hour)"
        print_info "Try with a different phone number or wait 1 hour"
        print_info "Usage: ./test-api.sh <phone-number>"
        return 1
    else
        print_error "Failed to send OTP (HTTP $HTTP_CODE)"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
        return 1
    fi
}

# Test 3: Send OTP - Invalid Phone (should fail)
test_send_otp_invalid() {
    print_test "3️⃣  Send OTP - Invalid Phone (Should Fail)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/send-otp" \
        -H "Content-Type: application/json" \
        -d '{"phone":"123"}')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" = "400" ]; then
        print_success "Validation error handled correctly"
    else
        print_error "Expected 400, got $HTTP_CODE"
    fi
}

# Test 4: Verify OTP
test_verify_otp() {
    print_test "4️⃣  Verify OTP"
    print_info "Enter OTP from server console (or press Enter to skip):"
    read -r TEST_OTP
    
    if [ -z "$TEST_OTP" ]; then
        print_info "Skipping OTP verification test"
        print_info "For manual test, use: curl -X POST $BASE_URL/auth/verify-otp -H 'Content-Type: application/json' -d '{\"phone\":\"$TEST_PHONE\",\"otp\":\"YOUR_OTP\"}'"
        return 1
    fi
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/verify-otp" \
        -H "Content-Type: application/json" \
        -d "{\"phone\":\"$TEST_PHONE\",\"otp\":\"$TEST_OTP\"}")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" = "200" ]; then
        ACCESS_TOKEN=$(echo "$BODY" | jq -r '.accessToken // empty')
        REFRESH_TOKEN=$(echo "$BODY" | jq -r '.refreshToken // empty')
        USER_ID=$(echo "$BODY" | jq -r '.user.id // empty')
        
        if [ -n "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
            print_success "OTP verified successfully"
            print_info "Access Token: ${ACCESS_TOKEN:0:50}..."
            print_info "Refresh Token: ${REFRESH_TOKEN:0:50}..."
            print_info "User ID: $USER_ID"
            return 0
        else
            print_error "Tokens not received"
            return 1
        fi
    else
        print_error "Failed to verify OTP (HTTP $HTTP_CODE)"
        return 1
    fi
}

# Test 5: Complete Profile
test_complete_profile() {
    if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
        print_info "Skipping profile test (no token)"
        return 1
    fi
    
    print_test "5️⃣  Complete Profile"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/users/profile" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Test User",
            "email": "test@example.com",
            "address": "123 Test Street",
            "city": "Indore",
            "state": "Madhya Pradesh",
            "pincode": "452001",
            "bio": "Test bio for testing",
            "isAvailable": true,
            "skills": ["farming", "gardening"],
            "experienceYears": 5,
            "labourType": "daily",
            "latitude": 22.7196,
            "longitude": 75.8577
        }')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" = "201" ]; then
        print_success "Profile completed successfully"
        USER_ID=$(echo "$BODY" | jq -r '.user.id // empty')
        return 0
    else
        print_error "Failed to complete profile (HTTP $HTTP_CODE)"
        # If profile already exists, that's okay
        if echo "$BODY" | grep -q "already completed"; then
            print_info "Profile already exists, continuing..."
            return 0
        fi
        return 1
    fi
}

# Test 6: Get Profile
test_get_profile() {
    if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
        print_info "Skipping get profile test (no token)"
        return 1
    fi
    
    print_test "6️⃣  Get Profile"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/users/profile" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "Profile retrieved successfully"
        return 0
    else
        print_error "Failed to get profile (HTTP $HTTP_CODE)"
        return 1
    fi
}

# Test 7: Update Profile
test_update_profile() {
    if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
        print_info "Skipping update profile test (no token)"
        return 1
    fi
    
    print_test "7️⃣  Update Profile"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/users/profile" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "bio": "Updated bio for testing",
            "skills": ["farming", "gardening", "plumbing"],
            "experienceYears": 7
        }')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "Profile updated successfully"
        return 0
    else
        print_error "Failed to update profile (HTTP $HTTP_CODE)"
        return 1
    fi
}

# Test 8: Toggle Availability
test_toggle_availability() {
    if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
        print_info "Skipping availability test (no token)"
        return 1
    fi
    
    print_test "8️⃣  Toggle Availability"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/users/availability" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"isAvailable": false}')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "Availability updated successfully"
        return 0
    else
        print_error "Failed to update availability (HTTP $HTTP_CODE)"
        return 1
    fi
}

# Test 9: Search Labours
test_search_labours() {
    if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
        print_info "Skipping search test (no token)"
        return 1
    fi
    
    print_test "9️⃣  Search Labours"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/labours?city=Indore&availableOnly=true&page=1&limit=10" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "Search completed successfully"
        # Get first labour ID for testing
        LABOUR_ID=$(echo "$BODY" | jq -r '.labours[0].id // empty')
        if [ -n "$LABOUR_ID" ] && [ "$LABOUR_ID" != "null" ]; then
            print_info "First Labour ID: $LABOUR_ID"
        fi
        return 0
    else
        print_error "Failed to search labours (HTTP $HTTP_CODE)"
        return 1
    fi
}

# Test 10: Get Labour Details
test_get_labour_details() {
    if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
        print_info "Skipping labour details test (no token)"
        return 1
    fi
    
    if [ -z "$LABOUR_ID" ] || [ "$LABOUR_ID" = "null" ]; then
        print_info "Skipping labour details test (no labour ID)"
        return 1
    fi
    
    print_test "🔟 Get Labour Details"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/labours/$LABOUR_ID" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "Labour details retrieved successfully"
        return 0
    else
        print_error "Failed to get labour details (HTTP $HTTP_CODE)"
        return 1
    fi
}

# Test 11: Get Nearby Labours
test_nearby_labours() {
    if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
        print_info "Skipping nearby labours test (no token)"
        return 1
    fi
    
    print_test "1️⃣1️⃣  Get Nearby Labours"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/labours/nearby?latitude=22.7196&longitude=75.8577&radius=10&limit=10" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "Nearby labours retrieved successfully"
        return 0
    else
        print_error "Failed to get nearby labours (HTTP $HTTP_CODE)"
        return 1
    fi
}

# Test 12: Add Review
test_add_review() {
    if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
        print_info "Skipping review test (no token)"
        return 1
    fi
    
    if [ -z "$LABOUR_ID" ] || [ "$LABOUR_ID" = "null" ]; then
        print_info "Skipping review test (no labour ID)"
        return 1
    fi
    
    print_test "1️⃣2️⃣  Add Review"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/reviews" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"labourId\": \"$LABOUR_ID\",
            \"rating\": 5,
            \"comment\": \"Excellent work! Very professional.\"
        }")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" = "201" ]; then
        print_success "Review added successfully"
        REVIEW_ID=$(echo "$BODY" | jq -r '.review.id // empty')
        return 0
    else
        print_error "Failed to add review (HTTP $HTTP_CODE)"
        # If already reviewed, that's okay
        if echo "$BODY" | grep -q "already"; then
            print_info "Review already exists, continuing..."
            return 0
        fi
        return 1
    fi
}

# Test 13: Get Reviews
test_get_reviews() {
    if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
        print_info "Skipping get reviews test (no token)"
        return 1
    fi
    
    if [ -z "$USER_ID" ] || [ "$USER_ID" = "null" ]; then
        print_info "Skipping get reviews test (no user ID)"
        return 1
    fi
    
    print_test "1️⃣3️⃣  Get Reviews"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/reviews/$USER_ID?page=1&limit=10" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "Reviews retrieved successfully"
        return 0
    else
        print_error "Failed to get reviews (HTTP $HTTP_CODE)"
        return 1
    fi
}

# Test 14: Track Contact
test_track_contact() {
    if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
        print_info "Skipping contact test (no token)"
        return 1
    fi
    
    if [ -z "$LABOUR_ID" ] || [ "$LABOUR_ID" = "null" ]; then
        print_info "Skipping contact test (no labour ID)"
        return 1
    fi
    
    print_test "1️⃣4️⃣  Track Contact"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/contacts" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"labourId\": \"$LABOUR_ID\",
            \"contactType\": \"call\"
        }")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" = "201" ]; then
        print_success "Contact tracked successfully"
        return 0
    else
        print_error "Failed to track contact (HTTP $HTTP_CODE)"
        return 1
    fi
}

# Test 15: Get Contact History
test_get_contact_history() {
    if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
        print_info "Skipping contact history test (no token)"
        return 1
    fi
    
    print_test "1️⃣5️⃣  Get Contact History"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/contacts/history?page=1&limit=10" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "Contact history retrieved successfully"
        return 0
    else
        print_error "Failed to get contact history (HTTP $HTTP_CODE)"
        return 1
    fi
}

# Test 16: Refresh Token
test_refresh_token() {
    if [ -z "$REFRESH_TOKEN" ] || [ "$REFRESH_TOKEN" = "null" ]; then
        print_info "Skipping refresh token test (no refresh token)"
        return 1
    fi
    
    print_test "1️⃣6️⃣  Refresh Token"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/refresh-token" \
        -H "Content-Type: application/json" \
        -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" = "200" ]; then
        NEW_ACCESS_TOKEN=$(echo "$BODY" | jq -r '.accessToken // empty')
        if [ -n "$NEW_ACCESS_TOKEN" ] && [ "$NEW_ACCESS_TOKEN" != "null" ]; then
            ACCESS_TOKEN="$NEW_ACCESS_TOKEN"
            print_success "Token refreshed successfully"
            print_info "New Access Token: ${ACCESS_TOKEN:0:50}..."
            return 0
        else
            print_error "New token not received"
            return 1
        fi
    else
        print_error "Failed to refresh token (HTTP $HTTP_CODE)"
        return 1
    fi
}

# Test 17: Logout
test_logout() {
    if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
        print_info "Skipping logout test (no token)"
        return 1
    fi
    
    if [ -z "$REFRESH_TOKEN" ] || [ "$REFRESH_TOKEN" = "null" ]; then
        print_info "Skipping logout test (no refresh token)"
        return 1
    fi
    
    print_test "1️⃣7️⃣  Logout"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/logout" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "Logged out successfully"
        return 0
    else
        print_error "Failed to logout (HTTP $HTTP_CODE)"
        return 1
    fi
}

# Test 18: Unauthorized Access (should fail)
test_unauthorized() {
    print_test "1️⃣8️⃣  Unauthorized Access Test (Should Fail)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/users/profile")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" = "401" ]; then
        print_success "Unauthorized access correctly blocked"
        return 0
    else
        print_error "Expected 401, got $HTTP_CODE"
        return 1
    fi
}

# Main execution
main() {
    echo ""
    echo "🧪 Rozgar360 Backend API - Comprehensive Test Suite"
    echo "=================================================="
    echo ""
    
    # Check server first
    if ! check_server; then
        exit 1
    fi
    
    # Run all tests
    test_health
    test_send_otp
    test_send_otp_invalid
    
    # Only continue with auth tests if OTP was sent successfully
    if test_verify_otp; then
        test_complete_profile
        test_get_profile
        test_update_profile
        test_toggle_availability
        test_search_labours
        test_get_labour_details
        test_nearby_labours
        test_add_review
        test_get_reviews
        test_track_contact
        test_get_contact_history
        test_refresh_token
        test_logout
    fi
    
    test_unauthorized
    
    # Summary
    echo ""
    echo "=================================================="
    echo -e "${GREEN}✅ Test Suite Completed!${NC}"
    echo ""
    echo "📝 Note: Some tests may be skipped if authentication is required"
    echo "   Run the script again after completing OTP verification"
    echo ""
}

# Run main function
main
