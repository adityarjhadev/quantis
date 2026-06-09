import asyncio
import random
import numpy as np
import time
import traceback

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
        self.last_anchor_update = 0
        self.ANCHOR_UPDATE_INTERVAL = 600  # 10 minutes

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

        # ----------------------------
        # MARKET TIME SCALING
        # ----------------------------
        self.TIME_SCALE = 0.02  # compress market movement (1 tick = 2% of real movement)

        # ----------------------------
        # MULTI-TIME MARKET CYCLES
        # ----------------------------
        self.market_time = 0.0

        # cycle amplitudes
        self.DAILY_CYCLE_AMP = 0.002
        self.WEEKLY_CYCLE_AMP = 0.004
        self.MONTHLY_CYCLE_AMP = 0.006
        self.YEARLY_CYCLE_AMP = 0.01

        # cycle speeds (compressed time domain)
        self.DAILY_SPEED = 2 * 3.1415
        self.WEEKLY_SPEED = 2 * 3.1415 / 7
        self.MONTHLY_SPEED = 2 * 3.1415 / 30
        self.YEARLY_SPEED = 2 * 3.1415 / 365

        # ----------------------------
        # MARKET STATE EXTENSIONS
        # ----------------------------
        self.return_history = []
        self.volatility_state = 0.0025

        self.regime = "neutral"
        self.regime_strength = 0.0
        self.regime_timer = 0

        self.last_shock_time = 0

        # ----------------------------
        # MULTI-TIMEFRAME MEMORY
        # ----------------------------
        self.price_history = []  # store recent prices
        self.max_history = 200

        # exponential moving averages (multi-timescale)
        self.ema_short = None
        self.ema_mid = None
        self.ema_long = None

        self.EMA_SHORT_ALPHA = 0.25   # ~1 day behavior
        self.EMA_MID_ALPHA = 0.08     # ~1 week behavior
        self.EMA_LONG_ALPHA = 0.02    # ~1 month behavior

        # ----------------------------
        # STABLE FUNDAMENTALS (DO NOT RANDOMIZE FREQUENTLY)
        # ----------------------------
        self.fundamentals = {
            "pe": random.uniform(15, 30),
            "beta": random.uniform(0.8, 1.3),
            "profit_margin": random.uniform(0.08, 0.28),
            "market_cap": random.randint(1_000_000_000, 3_000_000_000_000)
        }

        # slow drift control (prevents chaos)
        self.fundamental_drift_timer = 0

        # ----------------------------
        # FUNDAMENTAL STABILITY CONTROL
        # ----------------------------
        self.last_fundamental_update = 0
        self.fundamental_update_interval = 300  # 5 minutes real time

        # ----------------------------
        # VOLUME STATE (SMOOTHED)
        # ----------------------------
        self.volume_state = random.randint(2_000_000, 8_000_000)
        self.volume_target = self.volume_state

        # ----------------------------
        # MARKET BENCHMARK (for beta calculation)
        # ----------------------------
        self.market_returns = []
        self.stock_returns = []
        self.max_return_history = 200

        # ----------------------------
        # TECHNICAL INDICATORS
        # ----------------------------
        self.atr = 0.0
        self.support = None
        self.resistance = None
        self.support_resistance_window = 50

        # beta tracking
        self.beta_value = 1.0

    # =========================================================
    # ANCHOR LOOP (REAL MARKET DATA)
    # =========================================================
    async def anchor_loop(self):
        while True:
            try:
                now = time.time()

                # only fetch real market data every 10 minutes
                if now - self.last_anchor_update > self.ANCHOR_UPDATE_INTERVAL:
                    import yfinance as yf  # local import to avoid global dependency issues

                    stock = yf.Ticker(self.ticker)
                    data = stock.history(period="1d", interval="1m")

                    if not data.empty:
                        new_anchor = float(data["Close"].iloc[-1])

                        if self.anchor_price is not None:
                            delta = new_anchor - self.anchor_price
                            self.trend += (1 if delta > 0 else -1) * 0.0008

                        self.anchor_price = new_anchor
                        self.last_anchor_update = now

                # update features occasionally (simulation-driven fallback)
                if now - self.last_feature_update > 60:
                    self.features = self.fetch_features()
                    self.last_feature_update = now

            except Exception as e:
                print(f"[{self.ticker}] anchor error:", e)
                traceback.print_exc()

            await asyncio.sleep(60)

    # =========================================================
    # TREND SYSTEM
    # =========================================================
    def _update_trend(self):
        self.trend *= self.TREND_PERSISTENCE

        # memory influence
        if len(self.return_history) > 5:
            memory_signal = sum(self.return_history[-5:]) * 0.01
            self.trend += memory_signal

        # random noise
        self.trend += random.uniform(-self.TREND_STRENGTH, self.TREND_STRENGTH)

        # regime influence
        self._update_regime()
        self.trend += self.regime_strength

        # clamp
        self.trend = max(min(self.trend, 0.02), -0.02)

    # =========================================================
    # REGIME SYSTEM
    # =========================================================
    def _update_regime(self):
        if not hasattr(self, "regime_counter"):
            self.regime_counter = 0

        self.regime_counter += 1

        if self.regime_counter > random.randint(300, 1200):
            self.regime = random.choice(["bull", "bear", "sideways", "volatile"])
            self.regime_counter = 0

        if self.regime == "bull":
            self.regime_strength = 0.0006
        elif self.regime == "bear":
            self.regime_strength = -0.0006
        elif self.regime == "volatile":
            self.regime_strength = random.uniform(-0.0015, 0.0015)
        else:
            self.regime_strength = 0.0

    # =========================================================
    # VOLATILITY CLUSTERING (GARCH-LITE)
    # =========================================================
    def _update_volatility(self):
        shock = abs(random.gauss(0, 1)) * 0.01

        self.volatility_state = (
            0.96 * self.volatility_state +
            0.04 * shock
        )

        self.volatility_state = max(0.001, min(self.volatility_state, 0.03))

    # =========================================================
    # RETURN MEMORY
    # =========================================================
    def _update_memory(self, return_val):
        self.return_history.append(return_val)
        if len(self.return_history) > 50:
            self.return_history.pop(0)

    # =========================================================
    # SHOCK SYSTEM
    # =========================================================
    def _maybe_shock(self, price):
        # rare event shocks
        if random.random() < 0.001 * self.TIME_SCALE:
            shock = random.uniform(-0.05, 0.05)
            return price * (1 + shock)
        return price

    # =========================================================
    # MULTI-TIMESCALE MARKET CYCLE SIGNAL
    # =========================================================
    def _market_cycle_signal(self):
        """Multi-timescale deterministic market seasonality"""

        t = self.market_time

        daily = self.DAILY_CYCLE_AMP * np.sin(self.DAILY_SPEED * t)
        weekly = self.WEEKLY_CYCLE_AMP * np.sin(self.WEEKLY_SPEED * t)
        monthly = self.MONTHLY_CYCLE_AMP * np.sin(self.MONTHLY_SPEED * t)
        yearly = self.YEARLY_CYCLE_AMP * np.sin(self.YEARLY_SPEED * t)

        # seasonal bias (winter volatility higher, etc.)
        season_factor = 1.0 + 0.5 * np.sin(self.YEARLY_SPEED * t + 1.5)

        return (daily + weekly + monthly + yearly) * season_factor

    # =========================================================
    # UPDATE TECHNICALS
    # =========================================================
    def _update_technicals(self, current_price, prev_price):
        """Compute ATR, support, resistance, and returns for beta"""

        if prev_price is None or current_price is None:
            return

        # ----------------------------
        # RETURNS
        # ----------------------------
        ret = (current_price - prev_price) / max(prev_price, 1)

        self.stock_returns.append(ret)
        if len(self.stock_returns) > self.max_return_history:
            self.stock_returns.pop(0)

        # synthetic market return proxy (anchor-based)
        if self.anchor_price:
            market_ret = random.uniform(-0.001, 0.001) + (self.trend * 0.1)
        else:
            market_ret = 0.0

        self.market_returns.append(market_ret)
        if len(self.market_returns) > self.max_return_history:
            self.market_returns.pop(0)

        # ----------------------------
        # ATR (Average True Range simplified)
        # ----------------------------
        tr = abs(current_price - prev_price)
        self.atr = 0.9 * self.atr + 0.1 * tr

        # ----------------------------
        # SUPPORT / RESISTANCE
        # ----------------------------
        window = self.price_history[-self.support_resistance_window:]
        if len(window) > 10:
            self.support = min(window)
            self.resistance = max(window)

        # ----------------------------
        # BETA (rolling covariance approximation)
        # ----------------------------
        if len(self.stock_returns) > 20 and len(self.market_returns) > 20:
            s = np.array(self.stock_returns[-50:])
            m = np.array(self.market_returns[-50:])

            if np.var(m) > 0:
                cov = np.mean((s - np.mean(s)) * (m - np.mean(m)))
                var = np.var(m)
                self.beta_value = cov / var

    # =========================================================
    # SIMULATION LOOP
    # =========================================================
    async def simulate_loop(self):
        while True:
            self.market_time += 0.05 * self.TIME_SCALE

            if self.anchor_price is not None:

                if self.display_price is None:
                    self.display_price = self.anchor_price

                current = self.display_price
                anchor = self.anchor_price

                # update trend system
                self._update_trend()

                # base stochastic noise
                noise = random.gauss(0, 1) * self.volatility_state * current

                # macro drift
                macro = current * self.MACRO_BIAS

                # trend effect
                trend_component = current * self.trend

                # EMA structural signal (important correction)
                ema_signal = 0
                if self.ema_short is not None:
                    ema_signal = (self.ema_short - self.ema_long) * 0.01 * current

                # regime influence already embedded in trend

                # cycle influence (NEW MAJOR FEATURE)
                cycle_signal = self._market_cycle_signal() * current

                # momentum update (stable scaling)
                self.momentum = (
                    self.momentum * self.MOMENTUM_DECAY
                    + (noise + trend_component) * 0.05
                )

                # mean reversion
                revert = (self.anchor_price - current) * self.MEAN_REVERT if self.anchor_price else 0

                # combined return signal (NO TIME SCALE MULTIPLICATION)
                return_signal = (
                    noise + macro + trend_component + self.momentum + revert + ema_signal + cycle_signal
                )

                # ------------------------------
                # FUNDAMENTAL VALUE EFFECT (PE + PROFIT MARGIN)
                # ------------------------------
                fundamental_bias = 0.0

                if self.fundamentals.get("pe"):
                    # lower PE = undervalued -> upward pressure
                    fundamental_bias += (20 - self.fundamentals["pe"]) * 0.00002

                if self.fundamentals.get("profit_margin"):
                    # higher profit margin = upward drift
                    fundamental_bias += (self.fundamentals["profit_margin"] - 0.15) * 0.0005

                # apply beta risk scaling (high beta = more movement)
                beta_scale = self.beta_value if hasattr(self, "beta_value") else 1.0

                return_rate = (return_signal / max(current, 1)) * beta_scale + fundamental_bias

                next_price = current * (1 + return_rate)

                # ------------------------------
                # INCLUDE ATR IN VOLATILITY (IMPORTANT REALISM FIX)
                # ------------------------------
                atr_component = self.atr / max(current, 1)

                next_price += random.gauss(0, self.volatility_state + atr_component) * current

                # shock system
                next_price = self._maybe_shock(next_price)

                # anchor blending
                if self.anchor_price:
                    next_price += (self.anchor_price - next_price) * self.ANCHOR_BLEND

                self.display_price = round(next_price, 2)

                # ------------------------------
                # UPDATE TECHNICAL INDICATORS
                # ------------------------------
                if len(self.price_history) > 1:
                    prev = self.price_history[-1]
                else:
                    prev = self.display_price

                self._update_technicals(self.display_price, prev)

                # ==============================
                # MULTI-TIMEFRAME TRACKING
                # ==============================
                self.price_history.append(self.display_price)
                if len(self.price_history) > self.max_history:
                    self.price_history.pop(0)

                # update EMAs
                self._update_ema(self.display_price)

                # smooth volume evolution (no sudden jumps)
                vol_change = random.uniform(-0.03, 0.03)
                self.volume_target *= (1 + vol_change)
                self.volume_state = 0.9 * self.volume_state + 0.1 * self.volume_target

            await asyncio.sleep(50)

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
        """Stable + smoothed features with controlled fundamental drift"""

        now = time.time()

        base = self.anchor_price if self.anchor_price else 100

        # ensure EMAs exist
        if self.ema_short is None:
            short = mid = long = base
        else:
            short = self.ema_short
            mid = self.ema_mid
            long = self.ema_long

        # ----------------------------
        # SMOOTH VOLATILITY METRIC
        # ----------------------------
        trend_vol = abs(self.trend)
        if not hasattr(self, "_trend_vol_ema"):
            self._trend_vol_ema = trend_vol
        else:
            self._trend_vol_ema = 0.9 * self._trend_vol_ema + 0.1 * trend_vol

        # ----------------------------
        # CONTROLLED FUNDAMENTAL DRIFT (NOT EVERY CALL)
        # ----------------------------
        if now - self.last_fundamental_update > self.fundamental_update_interval:
            for k in self.fundamentals:
                drift = random.uniform(-0.0005, 0.0005)  # MUCH smaller drift
                self.fundamentals[k] *= (1 + drift)

            # clamp fundamentals
            self.fundamentals["pe"] = max(8, min(self.fundamentals["pe"], 45))
            self.fundamentals["beta"] = max(0.3, min(self.fundamentals["beta"], 2.0))
            self.fundamentals["profit_margin"] = max(0.02, min(self.fundamentals["profit_margin"], 0.4))

            self.last_fundamental_update = now

        # ----------------------------
        # STABLE VOLUME (NO SHARP CHANGES)
        # ----------------------------
        volume = int(self.volume_state)

        # ----------------------------
        # RETURN STABLE FEATURES
        # ----------------------------
        return {
            # multi-timeframe structure
            "price_short": float(short),
            "price_mid": float(mid),
            "price_long": float(long),

            # smoothed volatility metric
            "trend_volatility": float(self._trend_vol_ema),

            # stable fundamentals (no rapid jumps)
            "pe": float(self.fundamentals["pe"]),
            "profit_margin": float(self.fundamentals["profit_margin"]),
            "market_cap": float(self.fundamentals["market_cap"]),

            # technical indicators
            "atr": float(self.atr),
            "support": float(self.support) if self.support else None,
            "resistance": float(self.resistance) if self.resistance else None,
            "beta": float(self.beta_value),

            # smooth volume
            "volume_avg": volume
        }

    def _update_ema(self, value):
        if self.ema_short is None:
            self.ema_short = self.ema_mid = self.ema_long = value

        self.ema_short = self.EMA_SHORT_ALPHA * value + (1 - self.EMA_SHORT_ALPHA) * self.ema_short
        self.ema_mid = self.EMA_MID_ALPHA * value + (1 - self.EMA_MID_ALPHA) * self.ema_mid
        self.ema_long = self.EMA_LONG_ALPHA * value + (1 - self.EMA_LONG_ALPHA) * self.ema_long