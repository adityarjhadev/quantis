import yfinance as yf
import asyncio
import random
import numpy as np
import time

class StockEngine:
    def __init__(self, ticker: str):
        self.ticker = ticker.upper()

        # ----------------------------
        # STATE
        # ----------------------------
        self.anchor_price = None
        self.display_price = None

        self.trend = random.uniform(-0.0005, 0.0005)
        self.momentum = 0.0
        self.features = None
        self.last_feature_update = 0

        # ----------------------------
        # CONFIG (realistic model)
        # ----------------------------
        self.VOLATILITY = 0.0025
        self.MEAN_REVERT = 0.04
        self.ANCHOR_BLEND = 0.12

        self.MACRO_BIAS = 0.00005

        self.TREND_PERSISTENCE = 0.995
        self.TREND_STRENGTH = 0.0006
        self.TREND_FLIP_CHANCE = 0.008

        self.MOMENTUM_DECAY = 0.92

    # =========================================================
    # ANCHOR LOOP (REAL MARKET DATA)
    # =========================================================
    async def anchor_loop(self):
        stock = yf.Ticker(self.ticker)

        while True:
            try:
                data = stock.history(period="1d", interval="1m")

                if not data.empty:
                    new_anchor = float(data["Close"].iloc[-1])

                    if self.anchor_price is not None:
                        delta = new_anchor - self.anchor_price
                        self.trend += (1 if delta > 0 else -1) * 0.0008

                    self.anchor_price = new_anchor

                    # Feature update (STEP 2 FIX)
                    now = time.time()
                    if now - self.last_feature_update > 60:
                        self.features = self.fetch_features()
                        self.last_feature_update = now

            except Exception as e:
                print(f"[{self.ticker}] anchor error:", e)

            await asyncio.sleep(60)

    # =========================================================
    # TREND SYSTEM
    # =========================================================
    def _update_trend(self):
        self.trend *= self.TREND_PERSISTENCE
        self.trend += random.uniform(-self.TREND_STRENGTH, self.TREND_STRENGTH)

        if random.random() < self.TREND_FLIP_CHANCE:
            self.trend *= -1

        self.trend = max(min(self.trend, 0.01), -0.01)

    # =========================================================
    # SIMULATION LOOP
    # =========================================================
    async def simulate_loop(self):
        while True:
            if self.anchor_price is not None:

                if self.display_price is None:
                    self.display_price = self.anchor_price

                current = self.display_price
                anchor = self.anchor_price

                # update trend
                self._update_trend()

                # noise
                noise = random.gauss(0, self.VOLATILITY) * current

                # macro (S&P-like drift)
                macro = current * self.MACRO_BIAS

                # trend
                trend_component = current * self.trend

                # momentum
                self.momentum = (
                    self.momentum * self.MOMENTUM_DECAY
                    + (noise + trend_component) * 0.08
                )

                # mean reversion
                revert = (anchor - current) * self.MEAN_REVERT

                # combine
                next_price = (
                    current
                    + noise
                    + macro
                    + trend_component
                    + self.momentum
                    + revert
                )

                # smooth anchor blending
                next_price += (anchor - next_price) * self.ANCHOR_BLEND

                self.display_price = round(next_price, 2)

            await asyncio.sleep(1)

    # =========================================================
    # API OUTPUT
    # =========================================================
    def get_price(self):
        return {
            "ticker": self.ticker,
            "price": self.display_price,
            "anchor": self.anchor_price,
            "trend": round(self.trend, 6),
            "momentum": round(self.momentum, 6),
        }

    def fetch_features(self):
        stock = yf.Ticker(self.ticker)

        info = stock.info or {}
        hist = stock.history(period="6mo", interval="1d")

        if hist is None or hist.empty:
            return None

        closes = hist["Close"]

        # PRICE FEATURES
        returns = closes.pct_change().dropna()

        volatility_20 = returns.rolling(20).std().iloc[-1] if len(returns) > 20 else 0
        volatility_60 = returns.rolling(60).std().iloc[-1] if len(returns) > 60 else volatility_20

        ma20 = closes.rolling(20).mean().iloc[-1] if len(closes) >= 20 else closes.iloc[-1]
        ma50 = closes.rolling(50).mean().iloc[-1] if len(closes) >= 50 else ma20
        ma200 = closes.rolling(200).mean().iloc[-1] if len(closes) >= 200 else ma50

        # RSI
        delta = closes.diff()
        gain = (delta.where(delta > 0, 0)).rolling(14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
        rs = gain / (loss + 1e-9)
        rsi = 100 - (100 / (1 + rs))
        rsi_val = rsi.iloc[-1]

        return {
            "volatility_20": float(volatility_20),
            "volatility_60": float(volatility_60),
            "ma20": float(ma20),
            "ma50": float(ma50),
            "ma200": float(ma200),
            "rsi": float(rsi_val) if rsi_val == rsi_val else 50,
            "beta": info.get("beta", 1.0),
            "market_cap": info.get("marketCap", 0),
            "pe": info.get("trailingPE") or 0,
            "profit_margin": info.get("profitMargins") or 0,
            "volume_avg": float(closes.pct_change().rolling(20).std().mean())
        }