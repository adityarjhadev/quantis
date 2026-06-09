#!/bin/bash
# Diagnostic script to identify the "load failed" issue

echo ""
echo "=========================================="
echo "🔍 DIAGNOSTIC - Finding 'Load Failed' Issue"
echo "=========================================="
echo ""

# Check if backend is running
echo "1️⃣  Checking if backend is running..."
curl -s http://localhost:8001/api/stock/AAPL > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Backend is running at localhost:8001"
else
    echo "   ❌ Backend is NOT running at localhost:8001"
    echo "   📝 Start it with: cd backend && python3 -m uvicorn main:app --reload --port 8001"
fi

# Check CORS
echo ""
echo "2️⃣  Testing CORS headers..."
cors_header=$(curl -s -i http://localhost:8001/api/stock/AAPL 2>&1 | grep -i "access-control-allow-origin" | head -1)
if [ -z "$cors_header" ]; then
    echo "   ⚠️  No CORS header found in response"
    echo "   This might cause frontend fetch failures"
else
    echo "   ✅ CORS header present: $(echo $cors_header | xargs)"
fi

# Test stock endpoint
echo ""
echo "3️⃣  Testing /api/stock/AAPL endpoint..."
response=$(curl -s http://localhost:8001/api/stock/AAPL 2>&1)
if echo "$response" | grep -q '"ticker"'; then
    echo "   ✅ Stock endpoint returns valid JSON"
    echo "   Response sample: $(echo $response | head -c 100)..."
else
    if echo "$response" | grep -q "Connection refused"; then
        echo "   ❌ Connection refused - Backend not running"
    elif echo "$response" | grep -q "error\|detail\|Error\|Detail"; then
        echo "   ❌ Backend returned an error:"
        echo "   $(echo $response | head -c 200)"
    else
        echo "   ❓ Unexpected response:"
        echo "   $(echo $response | head -c 200)"
    fi
fi

# Test trade endpoint
echo ""
echo "4️⃣  Testing POST /api/portfolio/independent/trade endpoint..."
trade_response=$(curl -s -X POST http://localhost:8001/api/portfolio/independent/trade \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","ticker":"AAPL","side":"buy","quantity":1}' 2>&1)

if echo "$trade_response" | grep -q '"portfolio"'; then
    echo "   ✅ Trade endpoint returns valid response"
    echo "   Has 'portfolio' wrapper: YES"
elif echo "$trade_response" | grep -q "Connection refused"; then
    echo "   ❌ Connection refused - Backend not running"
elif echo "$trade_response" | grep -q "error\|detail\|Error\|Detail"; then
    echo "   ⚠️  Trade endpoint returned error:"
    echo "   $(echo $trade_response | head -c 200)"
else
    echo "   ❓ Unexpected trade response:"
    echo "   $(echo $trade_response | head -c 200)"
fi

# Check if frontend can see backend
echo ""
echo "5️⃣  Frontend API_BASE check..."
echo "   Frontend set to: http://localhost:8001"
echo "   (Check browser console for CORS or network errors)"

echo ""
echo "=========================================="
echo "📝 NEXT STEPS:"
echo "=========================================="
echo ""
echo "If Backend is NOT running:"
echo "  1. Open Terminal"
echo "  2. cd /Users/adityajha/quantis/backend"
echo "  3. python3 -m uvicorn main:app --reload --port 8001"
echo "  4. Then try the frontend again"
echo ""
echo "If Backend IS running but frontend shows errors:"
echo "  1. Open browser DevTools (Cmd+Option+I)"
echo "  2. Go to Console tab"
echo "  3. Look for any red error messages about fetch/network"
echo "  4. Look for CORS errors"
echo "  5. Share the error message"
echo ""
echo "=========================================="
echo ""
