#!/bin/bash
# Test if Render API is working

echo "Testing Render API..."
echo "URL: https://tambola-jqjo.onrender.com"
echo ""

# Test root endpoint
echo "1. Testing root endpoint..."
curl -s https://tambola-jqjo.onrender.com/ | head -c 200
echo ""
echo ""

# Test API rooms endpoint (should return auth error, not 500)
echo "2. Testing /api/rooms endpoint..."
response=$(curl -s -w "\n%{http_code}" https://tambola-jqjo.onrender.com/api/rooms)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

echo "HTTP Code: $http_code"
echo "Response: $body"
echo ""

if [ "$http_code" = "401" ] || [ "$http_code" = "403" ]; then
    echo "✅ API is working! (Auth error is expected)"
elif [ "$http_code" = "500" ]; then
    echo "❌ API returning 500 error - OLD CODE still deployed"
else
    echo "⚠️  Unexpected response code: $http_code"
fi

echo ""
echo "3. Testing /api/tickets endpoint..."
curl -s https://tambola-jqjo.onrender.com/api/tickets/my-tickets/test-room \
  -H "Authorization: Bearer fake-token" | head -c 200
echo ""
echo ""

echo "If you see 'Internal Server Error' above, Render needs to redeploy!"
echo "Go to https://dashboard.render.com and click 'Manual Deploy'"
