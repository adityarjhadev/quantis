#!/usr/bin/env python3
"""
Test script to validate portfolio trading with real stock data
"""

import sys
sys.path.insert(0, '/Users/adityajha/quantis/backend')

from portfolio_manager import (
    fetch_stock_data_full, execute_buy, execute_sell, 
    build_portfolio_response, get_user_portfolio
)

def test_stock_data():
    """Test fetching real stock data"""
    print("\n📊 Testing stock data fetch...")
    stock_data = fetch_stock_data_full("AAPL")
    
    if not stock_data:
        print("❌ Failed to fetch AAPL data")
        return False
    
    print(f"✅ Fetched AAPL data:")
    print(f"   Price: ${stock_data['price']}")
    print(f"   History points: {len(stock_data['history'])}")
    print(f"   Metrics keys: {list(stock_data['metrics'].keys())}")
    
    required_metrics = ["rsi", "ma20", "ma50", "priceChange1d", "avgVolume", "support", "resistance"]
    for metric in required_metrics:
        if metric not in stock_data['metrics']:
            print(f"❌ Missing metric: {metric}")
            return False
    
    print(f"✅ All required metrics present")
    return True

def test_buy_sell():
    """Test buy and sell functionality"""
    print("\n💰 Testing buy/sell operations...")
    
    # Test buy
    success, msg, portfolio = execute_buy("test_user", "independent", "AAPL", 10)
    
    if not success:
        print(f"❌ Buy failed: {msg}")
        return False
    
    print(f"✅ Buy successful: {msg}")
    print(f"   Cash remaining: ${portfolio['cash']}")
    print(f"   Holdings: {len(portfolio['holdings_list'])}")
    
    if len(portfolio['holdings_list']) == 0:
        print("❌ No holdings after buy")
        return False
    
    holding = portfolio['holdings_list'][0]
    print(f"   {holding['symbol']}: {holding['shares']} shares @ ${holding['price']}")
    
    # Test sell
    success, msg, portfolio = execute_sell("test_user", "independent", "AAPL", 5)
    
    if not success:
        print(f"❌ Sell failed: {msg}")
        return False
    
    print(f"✅ Sell successful: {msg}")
    print(f"   Cash after sell: ${portfolio['cash']}")
    
    if len(portfolio['holdings_list']) == 0:
        print("❌ No holdings after partial sell")
        return False
    
    if portfolio['holdings_list'][0]['shares'] != 5:
        print(f"❌ Wrong share count: {portfolio['holdings_list'][0]['shares']}")
        return False
    
    print("✅ Share count correct after partial sell")
    return True

def test_portfolio_response():
    """Test portfolio response format"""
    print("\n📈 Testing portfolio response format...")
    
    response = build_portfolio_response("test_user", "independent")
    
    required_fields = [
        "portfolio_id", "name", "cash", "totalValue", "total_pnl", 
        "pnl", "pnlPercent", "holdings", "holdings_list", "trades"
    ]
    
    for field in required_fields:
        if field not in response:
            print(f"❌ Missing field: {field}")
            return False
    
    print(f"✅ All required fields present")
    print(f"   Total Value: ${response['totalValue']}")
    print(f"   Total PnL: ${response['pnl']} ({response['pnlPercent']:.2f}%)")
    print(f"   Holdings: {response['holdings']}")
    
    if len(response['holdings_list']) > 0:
        holding = response['holdings_list'][0]
        required_holding_fields = [
            "symbol", "qty", "shares", "price", "value", "pnl", "pnlPercent", "history"
        ]
        for field in required_holding_fields:
            if field not in holding:
                print(f"❌ Missing holding field: {field}")
                return False
        print(f"✅ All holding fields present")
    
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 PORTFOLIO SYSTEM TEST")
    print("=" * 60)
    
    all_pass = True
    
    all_pass = test_stock_data() and all_pass
    all_pass = test_buy_sell() and all_pass
    all_pass = test_portfolio_response() and all_pass
    
    print("\n" + "=" * 60)
    if all_pass:
        print("✅ ALL TESTS PASSED")
    else:
        print("❌ SOME TESTS FAILED")
    print("=" * 60)
    
    sys.exit(0 if all_pass else 1)
