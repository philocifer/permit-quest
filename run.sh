#!/bin/bash

# Permit Quest - Launch Script
echo "🚗 Starting Permit Quest - Washington Driver's Test Prep"
echo "================================================="
echo ""

# Check if Python is available
if command -v python3 &> /dev/null; then
    echo "🚀 Launching with Python 3..."
    echo "📱 Open your browser and visit: http://localhost:8000"
    echo "💡 On Android: Add to Home Screen for app-like experience"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "🚀 Launching with Python 2..."
    echo "📱 Open your browser and visit: http://localhost:8000"
    echo "💡 On Android: Add to Home Screen for app-like experience"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python -m SimpleHTTPServer 8000
else
    echo "❌ Python not found. Please install Python or open index.html directly in your browser."
    echo "📂 Alternative: Open index.html file directly in any modern web browser"
fi
