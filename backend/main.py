from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router as dashboard_router
from stock_engine import StockEngine
import asyncio

app = FastAPI()

# Stock engine instances for active stocks
stock_engines = {}
active_tickers = ["AAPL", "TSLA", "MSFT", "NVDA", "AMZN"]

@app.on_event("startup")
async def startup_event():
    """Initialize stock engines on startup"""
    for ticker in active_tickers:
        engine = StockEngine(ticker)
        stock_engines[ticker] = engine
        # Start anchor and simulation loops as background tasks
        asyncio.create_task(engine.anchor_loop())
        asyncio.create_task(engine.simulate_loop())
    
    # Set stock_engines reference in routes.py
    from routes import set_stock_engines
    set_stock_engines(stock_engines)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "https://fine-baths-sink.loca.lt",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include dashboard routes (includes portfolio trading, stock quotes, etc.)
app.include_router(dashboard_router)

@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "ok"}

@app.get("/api/simulation/{ticker}")
def get_simulation_price(ticker: str):
    """Get simulated stock price from StockEngine"""
    ticker = ticker.upper()
    if ticker not in stock_engines:
        return {"error": f"No engine for ticker {ticker}"}
    return stock_engines[ticker].get_price()

@app.get("/api/simulation")
def get_all_simulations():
    """Get all simulated stock prices"""
    return {ticker: engine.get_price() for ticker, engine in stock_engines.items()}
