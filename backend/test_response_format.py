#!/usr/bin/env python3
"""
Test the exact response format that will be sent to frontend
"""

import sys
sys.path.insert(0, '/Users/adityajha/quantis/backend')

from routes import execute_portfolio_trade
from portfolio_manager import execute_buy, build_portfolio_response

print("\n" + "="*60)
print("Testing Response Format for Frontend")
print("="*60 + "\n")

# Test buy execution
print("1. Direct buy execution:")
success, msg, portfolio_resp = execute_buy("test@user.com", "independent", "AAPL", 5)
print(f"   Type: {type(portfolio_resp)}")
print(f"   Keys: {list(portfolio_resp.keys())[:5]}...")  # Show first 5 keys
print(f"   Has 'holdings_list': {'holdings_list' in portfolio_resp}")

# Test what the route returns
print("\n2. Testing route wrapper format:")
print("   The endpoint wraps it as:")
wrapped = {
    "portfolio": {
        "independent": portfolio_resp
    }
}
print(f"   Response keys: {list(wrapped.keys())}")
print(f"   Response['portfolio'] keys: {list(wrapped['portfolio'].keys())}")
print(f"   Response['portfolio']['independent'] keys (first 5): {list(wrapped['portfolio']['independent'].keys())[:5]}...")

# Test what frontend expects
print("\n3. Frontend state structure:")
print("   Current state has 'portfolio' object with:")
print("   - portfolio['independent'] = { ...holdings_list, cash, etc. }")
print("   - portfolio['school'] = { ... }")
print("   - portfolio['global'] = { ... }")

print("\n4. After frontend receives wrapped response:")
print("   onStateChange({...data, portfolio: nextState.portfolio})")
print("   This replaces entire portfolio object with:")
print(f"   portfolio: {list(wrapped['portfolio'].keys())}")

print("\n" + "="*60)
if 'holdings_list' in portfolio_resp:
    print("✅ Response format looks correct!")
else:
    print("❌ Response format might be missing holdings_list!")
print("="*60 + "\n")
