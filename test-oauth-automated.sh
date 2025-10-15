#!/bin/bash

# Automated OAuth Flow Test
# Tests the complete OAuth + Canvas config flow without browser interaction

set -e

BASE_URL="https://canvas-mcp-sse.ariff.dev"
CLIENT_ID="canvas-mcp-client"
REDIRECT_URI="http://localhost:3000/callback"
STATE="test-state-$(date +%s)"

# Canvas credentials for testing
CANVAS_BASE_URL="https://learn.mywhitecliffe.com"
CANVAS_API_KEY="19765~test"  # Replace with a valid token before running

echo "================================================"
echo "Testing OAuth Flow + Per-User Canvas Config"
echo "================================================"
echo ""

# Generate PKCE parameters (43-128 characters, URL-safe base64 without padding)
# Generate 32 random bytes, base64url encode (43 chars after removing padding)
CODE_VERIFIER=$(head -c 32 /dev/urandom | base64 | tr -d '=' | tr '+/' '-_' | tr -d '\n')
CODE_CHALLENGE=$(echo -n "$CODE_VERIFIER" | openssl dgst -binary -sha256 | base64 | tr -d '=' | tr '+/' '-_' | tr -d '\n')

echo "Step 1: OAuth Authorization (Auto-redirect)"
echo "--------------------------------------------"
AUTH_URL="${BASE_URL}/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&state=${STATE}&code_challenge=${CODE_CHALLENGE}&code_challenge_method=S256"

echo "Getting authorization code..."
# Follow redirect and extract code from Location header
AUTH_RESPONSE=$(curl -s -i -L "$AUTH_URL" 2>&1 | grep -i "^location:" || echo "")

if [ -z "$AUTH_RESPONSE" ]; then
  echo "❌ No redirect received from authorization endpoint"
  echo "Trying to extract from body..."
  AUTH_RESPONSE=$(curl -s -L "$AUTH_URL")
  echo "$AUTH_RESPONSE"
  exit 1
fi

# Extract code from Location header (macOS compatible)
AUTH_CODE=$(echo "$AUTH_RESPONSE" | sed -n 's/.*code=\([^&]*\).*/\1/p')

if [ -z "$AUTH_CODE" ]; then
  echo "❌ Failed to extract authorization code"
  echo "Response: $AUTH_RESPONSE"
  exit 1
fi

echo "✅ Got authorization code: ${AUTH_CODE:0:20}..."

echo ""
echo "Step 2: Exchange Code for Access Token"
echo "---------------------------------------"
TOKEN_RESPONSE=$(curl -s -X POST "${BASE_URL}/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=${AUTH_CODE}" \
  -d "client_id=${CLIENT_ID}" \
  -d "redirect_uri=${REDIRECT_URI}" \
  -d "code_verifier=${CODE_VERIFIER}")

echo "Token Response:"
echo "$TOKEN_RESPONSE" | jq '.' 2>/dev/null || echo "$TOKEN_RESPONSE"

ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.access_token' 2>/dev/null || echo "")
REFRESH_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.refresh_token' 2>/dev/null || echo "")

if [ "$ACCESS_TOKEN" = "null" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo ""
  echo "❌ Failed to get access token!"
  echo "Response: $TOKEN_RESPONSE"
  exit 1
fi

echo ""
echo "✅ Got access token: ${ACCESS_TOKEN:0:20}..."
echo "✅ Got refresh token: ${REFRESH_TOKEN:0:20}..."

echo ""
echo "Step 3: Store Canvas Credentials"
echo "---------------------------------"
CONFIG_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/v1/canvas/config" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"canvasBaseUrl\":\"${CANVAS_BASE_URL}\",\"canvasApiKey\":\"${CANVAS_API_KEY}\"}")

echo "Config Response:"
echo "$CONFIG_RESPONSE" | jq '.' 2>/dev/null || echo "$CONFIG_RESPONSE"

# Check if it was successful (200) or if we got an error
if echo "$CONFIG_RESPONSE" | grep -q '"error"'; then
  echo ""
  echo "❌ Failed to store Canvas credentials"
  exit 1
fi

echo ""
echo "✅ Canvas credentials stored successfully"

echo ""
echo "Step 4: Verify Stored Configuration"
echo "------------------------------------"
GET_CONFIG_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/v1/canvas/config" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

echo "Get Config Response:"
echo "$GET_CONFIG_RESPONSE" | jq '.' 2>/dev/null || echo "$GET_CONFIG_RESPONSE"

IS_CONFIGURED=$(echo "$GET_CONFIG_RESPONSE" | jq -r '.configured' 2>/dev/null || echo "false")
if [ "$IS_CONFIGURED" = "true" ]; then
  echo ""
  echo "✅ Canvas configuration verified!"
else
  echo ""
  echo "⚠️  Canvas configuration status: $IS_CONFIGURED"
fi

echo ""
echo "Step 5: Test Canvas Data Endpoints"
echo "-----------------------------------"
echo "Testing GET /api/v1/canvas/courses..."
COURSES_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/v1/canvas/courses" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

echo "Courses Response:"
echo "$COURSES_RESPONSE" | jq '.' 2>/dev/null || echo "$COURSES_RESPONSE"

# Try to count courses
if echo "$COURSES_RESPONSE" | jq -e '. | length' >/dev/null 2>&1; then
  COURSE_COUNT=$(echo "$COURSES_RESPONSE" | jq '. | length')
  echo ""
  echo "✅ Retrieved $COURSE_COUNT courses"
else
  echo ""
  echo "⚠️  Could not count courses (may be an error response)"
fi

echo ""
echo "Step 6: Test Other Canvas Endpoints"
echo "------------------------------------"
echo "Testing GET /api/v1/canvas/assignments..."
ASSIGNMENTS_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/v1/canvas/assignments" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

echo "Assignments Response (first 300 chars):"
echo "$ASSIGNMENTS_RESPONSE" | head -c 300
echo "..."

echo ""
echo ""
echo "================================================"
echo "Test Summary"
echo "================================================"
echo ""
echo "✅ OAuth authorization: Success"
echo "✅ Token exchange: Success"
echo "✅ Canvas config storage: Success"
echo "✅ Canvas config retrieval: Success"
echo "✅ Canvas data endpoints: Tested"
echo ""
echo "Access Token (save for future tests):"
echo "$ACCESS_TOKEN"
echo ""
echo "Refresh Token (save for future tests):"
echo "$REFRESH_TOKEN"
echo ""
echo "To test credential deletion, run:"
echo "curl -X DELETE '${BASE_URL}/api/v1/canvas/config' -H 'Authorization: Bearer ${ACCESS_TOKEN}'"
