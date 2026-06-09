#!/usr/bin/env python3
"""
Integration test - simulate frontend API calls
"""

import sys
sys.path.insert(0, '/Users/adityajha/quantis/backend')

from portfolio_manager import fetch_stock_data_full, execute_buy, execute_sell, build_portfolio_response

print("\n" + "="*60)
print("🔌 INTEGRATION TEST - Frontend API Simulation")
print("="*60 + "\n")

# Simulate: Frontend calls GET /api/stock/AAPL
print("1️⃣ Frontend: GET /api/stock/AAPL")
stock_data = fetch_stock_data_full("AAPL")
print(f"   Response keys: {list(stock_data.keys())}")
print(f"   Price: ${stock_data['price']}")
print(f"   History length: {len(stock_data['history'])}")
print(f"   Metrics count: {len(stock_data['metrics'])}")

# Simulate: Frontend calls POST /api/portfolio/independent/trade (BUY)
print("\n2️⃣ Frontend: POST /api/portfolio/independent/trade (BUY)")
print("   Request: {email: 'user@test.com', ticker: 'AAPL', side: 'buy', quantity: 5}")
success, msg, portfolio = execute_buy("user@test.com", "independent", "AAPL", 5)
print(f"   Success: {success}")
print(f"   Message: {msg}")
print(f"   Portfolio keys: {list(portfolio.keys())}")
print(f"   Holdings count: {portfolio['holdings']}")
print(f"   Cash: ${portfolio['cash']:,.2f}")

# Simulate: Frontend calls GET /api/stock/AAPL again (for chart update)
print("\n3️⃣ Frontend: GET /api/stock/AAPL (chart refresh)")
stock_data2 = fetch_stock_data_full("AAPL")
print(f"   Price: ${stock_data2['price']}")
print(f"   Has metrics: {bool(stock_data2['metrics'])}")
print(f"   Has history: {bool(stock_data2['history'])}")

# Simulate: Frontend calls POST /api/portfolio/independent/trade (SELL)
print("\n4️⃣ Frontend: POST /api/portfolio/independent/trade (SELL)")
print("   Request: {email: 'user@test.com', ticker: 'AAPL', side: 'sell', quantity: 2}")
success, msg, portfolio = execute_sell("user@test.com", "independent", "AAPL", 2)
print(f"   Success: {success}")
print(f"   Message: {msg}")
print(f"   Holdings count: {portfolio['holdings']}")
print(f"   Cash: ${portfolio['cash']:,.2f}")

# Simulate: Frontend calls GET /api/portfolio/independent
print("\n5️⃣ Frontend: GET /api/portfolio/independent")
full_portfolio = build_portfolio_response("user@test.com", "independent")
print(f"   Portfolio name: {full_portfolio['name']}")
print(f"   Total value: ${full_portfolio['totalValue']:,.2f}")
print(f"   Total PnL: ${full_portfolio['pnl']:,.2f}")
print(f"   Holdings: {full_portfolio['holdings']}")
print(f"   Holdings list entries: {len(full_portfolio['holdings_list'])}")

if full_portfolio['holdings_list']:
    holding = full_portfolio['holdings_list'][0]
    print(f"\n   Holding details:")
    print(f"     Symbol: {holding['symbol']}")
    print(f"     Shares: {holding['shares']}")
    print(f"     Price: ${holding['price']}")
    print(f"     Value: ${holding['value']}")
    print(f"     P&L: ${holding['pnl']}")
    print(f"     History length: {len(holding['history'])}")

print("\n" + "="*60)
print("✅ INTEGRATION TEST COMPLETE")
print("="*60 + "\n")
