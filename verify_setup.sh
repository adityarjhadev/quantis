#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          QUANTIS PORTFOLIO SYSTEM - VERIFICATION            ║"
echo "╚════════════════════════════════════════════════════════════╝"

cd /Users/adityajha/quantis

# Check Python files
echo ""
echo "📝 Checking Python file syntax..."
python3 -c "
import py_compile
files = [
    'backend/main.py',
    'backend/routes.py',
    'backend/portfolio_manager.py'
]
for f in files:
    try:
        py_compile.compile(f, doraise=True)
        print(f'  ✅ {f}')
    except Exception as e:
        print(f'  ❌ {f}: {e}')
"

# Check required imports
echo ""
echo "📦 Checking imports..."
python3 -c "
try:
    import yfinance
    print('  ✅ yfinance')
except:
    print('  ❌ yfinance not installed')
    
try:
    import fastapi
    print('  ✅ fastapi')
except:
    print('  ❌ fastapi not installed')
"

# Check file structure
echo ""
echo "📂 Checking file structure..."
for file in \
    "backend/portfolio_manager.py" \
    "backend/routes.py" \
    "backend/main.py" \
    "frontend/src/dashboard.jsx" \
    "QUICK_START.md" \
    "backend/PORTFOLIO_IMPLEMENTATION.md"
do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (MISSING)"
    fi
done

# Check endpoints in routes.py
echo ""
echo "🔗 Checking API endpoints..."
python3 -c "
import re
with open('backend/routes.py', 'r') as f:
    content = f.read()
    
endpoints = [
    (r'@router.post\(\"/api/portfolio/\{portfolio_id\}/trade\"\)', 'POST /api/portfolio/{portfolio_id}/trade'),
    (r'@router.get\(\"/api/stock/\{ticker\}\"\)', 'GET /api/stock/{ticker}'),
    (r'@router.get\(\"/api/portfolio/\{portfolio_id\}\"\)', 'GET /api/portfolio/{portfolio_id}'),
]

for pattern, name in endpoints:
    if re.search(pattern, content):
        print(f'  ✅ {name}')
    else:
        print(f'  ❌ {name} (NOT FOUND)')
"

# Check portfolio_manager functions
echo ""
echo "⚙️  Checking portfolio functions..."
python3 -c "
import re
with open('backend/portfolio_manager.py', 'r') as f:
    content = f.read()
    
functions = [
    'fetch_stock_data_full',
    'execute_buy',
    'execute_sell',
    'build_portfolio_response',
    'get_user_portfolio'
]

for func in functions:
    if f'def {func}' in content:
        print(f'  ✅ {func}()')
    else:
        print(f'  ❌ {func}() (NOT FOUND)')
"

# Check frontend API calls
echo ""
echo "🎨 Checking frontend API calls..."
python3 -c "
import re
with open('frontend/src/dashboard.jsx', 'r') as f:
    content = f.read()
    
endpoints = [
    (r'/api/stock/.*encodeURIComponent', 'GET /api/stock/{ticker}'),
    (r'/api/portfolio/.*selectedPortfolio.*trade', 'POST /api/portfolio/*/trade'),
]

for pattern, name in endpoints:
    if re.search(pattern, content):
        print(f'  ✅ {name}')
    else:
        print(f'  ❌ {name} (NOT FOUND)')
"

# Show run instructions
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    READY TO RUN                            ║"
echo "╚════════════════════════════════════════════════════════════╝"

echo ""
echo "✨ To start the application:"
echo ""
echo "  Backend (Terminal 1):"
echo "    cd /Users/adityajha/quantis/backend"
echo "    python3 -m uvicorn main:app --reload --port 8001"
echo ""
echo "  Frontend (Terminal 2):"
echo "    cd /Users/adityajha/quantis/frontend"
echo "    npm run dev"
echo ""
echo "📖 For full documentation:"
echo "    cat /Users/adityajha/quantis/QUICK_START.md"
echo "    cat /Users/adityajha/quantis/backend/PORTFOLIO_IMPLEMENTATION.md"
echo ""
echo "🧪 To run tests:"
echo "    python3 /Users/adityajha/quantis/backend/test_portfolio.py"
echo ""
echo "═══════════════════════════════════════════════════════════════"
