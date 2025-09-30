#!/bin/bash
# Canvas API Proxy - Health Check Script
# Check API status and availability

# Configuration
API_BASE_URL="${API_BASE_URL:-https://canvas-mcp.ariff.dev}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Canvas API Proxy - Health Check${NC}"
echo "================================"

echo "API Base URL: $API_BASE_URL"
echo ""

# Make request
echo -e "${YELLOW}Checking API health...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE_URL/health")

# Parse response
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ API is healthy${NC}"
    echo ""

    # Pretty print JSON
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ API is unhealthy (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo "Response:"
    echo "$BODY"
    exit 1
fi
