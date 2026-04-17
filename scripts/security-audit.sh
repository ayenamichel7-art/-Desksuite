#!/bin/bash
# 🛡️ Desksuite Security Audit Script

echo "--- 📦 Node.js Audit (Frontend) ---"
cd frontend && npm audit
cd ..

echo "--- 🐘 PHP Audit (Backend) ---"
cd backend && composer audit
cd ..

echo "--- 🐍 Python Audit (Worker) ---"
if command -v bandit &> /dev/null
then
    bandit -r python-worker -ll
else
    echo "Bandit not installed. Skipping Python security scan."
fi

echo "--- 🛡️ Secret Scan (Generic) ---"
# Simple grep for common secret patterns (can be improved with tools like git-secrets or truffleshog)
grep -rE "password|secret|key|token" . --exclude-dir={node_modules,vendor,storage,.git} | grep -vE "\.example|\.md|LICENSE"

echo "✅ Security Audit Complete!"
