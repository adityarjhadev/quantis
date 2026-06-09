# 🚀 Quantis Portfolio Trading System - Quick Start

## What Was Fixed

✅ **Portfolio Buy/Sell** now uses real stock data instead of just simulation
✅ **Stock metrics** include complete technical analysis (RSI, MAs, volatility, etc.)
✅ **Graphing data** with 20-day price history for every stock
✅ **Real P&L tracking** with avg cost basis and current prices
✅ **Full stats integration** with portfolio performance metrics

## How to Run

### Backend
```bash
cd /Users/adityajha/quantis/backend
python3 -m uvicorn main:app --reload --port 8001
```

Backend will start on `http://localhost:8001`

### Frontend  
```bash
cd /Users/adityajha/quantis/frontend
npm run dev
```

Frontend will start on `http://localhost:5173`

## API Endpoints (All Fixed)

### Portfolio Trading
**POST** `/api/portfolio/{portfolio_id}/trade`
- Buy or sell stocks in a portfolio
- Returns updated portfolio with real data

**GET** `/api/portfolio/{portfolio_id}`
- Get complete portfolio state with all holdings
- Includes metrics and P&L for each position

### Stock Data
**GET** `/api/stock/{ticker}`
- Get real-time stock quote
- Includes price, 20-day history, and 18+ metrics
- Works seamlessly with frontend graphs

## Usage Flow

### Buying Stocks
1. Enter ticker symbol (e.g., AAPL)
2. Enter quantity (e.g., 10)
3. Click "Buy"
4. Portfolio updates with real price from Yahoo Finance
5. Holdings display with current price and P&L

### Viewing Portfolio
- Holdings show real-time prices
- Each holding includes:
  - Share count
  - Current price
  - Total value
  - P&L ($)
  - P&L (%)
  - 20-day price chart
  - Technical metrics (RSI, MAs, volatility, etc.)

### Portfolio Stats
- Total Value: Cash + all positions at market price
- Total P&L: Sum of all position gains/losses
- Cash Available: Buying power for new trades
- Number of Holdings: Active positions
- Portfolio Volatility: Risk metric
- Diversification Score: Based on position count

## Testing

### Test Portfolio Operations
```bash
cd /Users/adityajha/quantis/backend
python3 test_portfolio.py
```

Expected output: ✅ ALL TESTS PASSED

### Manual API Test
```bash
# Get stock data
curl http://localhost:8001/api/stock/AAPL

# Buy stocks
curl -X POST http://localhost:8001/api/portfolio/independent/trade \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","ticker":"AAPL","side":"buy","quantity":10}'

# View portfolio
curl http://localhost:8001/api/portfolio/independent?email=test@example.com
```

## Data Architecture

### In-Memory Storage
User portfolios stored by: `user_portfolios[email][portfolio_id]`

**Portfolio Structure**:
```python
{
  "id": "independent",
  "user_id": "email@example.com",
  "cash": 96926.6,
  "positions": {
    "AAPL": {
      "qty": 10,
      "avg_price": 307.34,
      "entry_time": "2025-06-06T..."
    }
  },
  "trades": [
    {
      "type": "buy",
      "ticker": "AAPL",
      "quantity": 10,
      "price": 307.34,
      "total": 3073.4,
      "timestamp": "2025-06-06T..."
    }
  ]
}
```

### Holding Calculation
Each holding includes:
- Real-time price (from yfinance)
- 20-day price history (for charts)
- Market value = price × quantity
- Cost basis = avg_price × quantity
- P&L = market value - cost basis
- 18+ technical metrics

## Key Features

### Real Market Data
- All prices from Yahoo Finance
- Updated on every buy/sell
- Historical data for charts
- Technical indicators calculated

### Portfolio Management
- Multi-portfolio support (independent, school, global)
- Per-user tracking
- Trade history recording
- Cash management
- Position averaging

### Metrics & Analytics
- RSI, Moving Averages (5, 20, 50, 200)
- Volatility (20d, 60d)
- Support/Resistance levels
- Beta, Market Cap, P/E
- Average Volume
- Price changes (1d, 7d)
- ATR, EMA values

### Performance Tracking
- Individual position P&L
- Portfolio-wide P&L
- Diversification score
- Portfolio volatility

## Frontend Integration

The frontend automatically:
- Fetches stock data via `/api/stock/{ticker}`
- Displays 20-day price charts
- Shows all technical metrics
- Updates portfolio on buy/sell
- Calculates P&L in real-time
- Displays holdings with graphs

## Troubleshooting

### Issue: "Invalid ticker"
- Verify ticker symbol is correct (e.g., AAPL, MSFT)
- Check internet connection (needs yfinance access)

### Issue: "Insufficient funds"
- Check portfolio cash available
- Reduce order quantity

### Issue: Stock data not loading
- Verify backend is running on port 8001
- Check `VITE_API_BASE` environment variable
- Look for network errors in browser console

### Issue: Charts not displaying
- Verify stock history data is being returned
- Check browser console for graph rendering errors

## Performance Tips

- Portfolio updates cache stock data briefly
- Batch requests for multiple stocks
- Charts render efficiently with SVG paths
- Real-time updates every 2-3 seconds for holdings

## Future Enhancements

Planned features:
- Portfolio performance over time (daily snapshots)
- Advanced risk metrics (Sharpe ratio, Sortino)
- Position recommendations based on diversification
- Alert system for support/resistance breaks
- Options trading simulation
- Margin/leverage support
