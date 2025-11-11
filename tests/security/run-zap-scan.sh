#!/bin/bash

# OWASP ZAP Security Scan Script
# This script runs automated security tests against the Whoof Apps application

set -e

echo "🔒 Starting OWASP ZAP Security Scan..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ZAP_PORT=8080
REPORT_DIR="tests/security/reports"
CONFIG_FILE="tests/security/zap-config.yaml"

# Create reports directory if it doesn't exist
mkdir -p "$REPORT_DIR"

# Check if ZAP is installed
if ! command -v zap.sh &> /dev/null && ! command -v zap-cli &> /dev/null
then
    echo -e "${RED}❌ OWASP ZAP is not installed${NC}"
    echo "Please install ZAP from: https://www.zaproxy.org/download/"
    echo "Or use Docker: docker pull zaproxy/zap-stable"
    exit 1
fi

echo -e "${GREEN}✓ OWASP ZAP found${NC}"

# Check if target URL is set
if [ -z "$TARGET_URL" ]; then
    echo -e "${YELLOW}⚠ TARGET_URL not set, using default Supabase functions URL${NC}"
    export TARGET_URL="https://ozdaxhiqnfapfevdropz.supabase.co/functions/v1"
fi

echo -e "${GREEN}🎯 Target URL: $TARGET_URL${NC}"

# Run ZAP scan using automation framework
echo -e "${GREEN}🔍 Running automated security scan...${NC}"

if command -v docker &> /dev/null; then
    echo -e "${GREEN}Using Docker to run ZAP...${NC}"
    docker run --rm -v "$(pwd):/zap/wrk/:rw" \
        -t zaproxy/zap-stable \
        zap-baseline.py \
        -t "$TARGET_URL" \
        -r "$REPORT_DIR/zap-baseline-report.html" \
        -J "$REPORT_DIR/zap-baseline-report.json" \
        -w "$REPORT_DIR/zap-baseline-report.md" \
        -c "$CONFIG_FILE" \
        --hook=/zap/wrk/tests/security/zap-hooks.py \
        -I \
        -l INFO
else
    # Use local ZAP installation
    zap.sh -cmd \
        -addonupdate \
        -autorun "$CONFIG_FILE" \
        -port "$ZAP_PORT"
fi

# Check results
if [ -f "$REPORT_DIR/zap-report.html" ]; then
    echo -e "${GREEN}✅ Security scan completed${NC}"
    echo -e "${GREEN}📊 Report generated at: $REPORT_DIR/zap-report.html${NC}"
    
    # Parse JSON report for critical issues
    if [ -f "$REPORT_DIR/zap-baseline-report.json" ]; then
        HIGH_ALERTS=$(jq '[.site[].alerts[] | select(.riskcode == "3")] | length' "$REPORT_DIR/zap-baseline-report.json" 2>/dev/null || echo "0")
        MEDIUM_ALERTS=$(jq '[.site[].alerts[] | select(.riskcode == "2")] | length' "$REPORT_DIR/zap-baseline-report.json" 2>/dev/null || echo "0")
        
        echo ""
        echo -e "${YELLOW}📈 Scan Summary:${NC}"
        echo -e "  High Risk Alerts: ${RED}$HIGH_ALERTS${NC}"
        echo -e "  Medium Risk Alerts: ${YELLOW}$MEDIUM_ALERTS${NC}"
        
        if [ "$HIGH_ALERTS" -gt 0 ]; then
            echo -e "${RED}❌ CRITICAL: High-risk vulnerabilities detected!${NC}"
            exit 1
        elif [ "$MEDIUM_ALERTS" -gt 5 ]; then
            echo -e "${YELLOW}⚠ WARNING: Multiple medium-risk vulnerabilities detected${NC}"
            exit 1
        fi
    fi
else
    echo -e "${RED}❌ Security scan failed - no report generated${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Security scan passed - no critical vulnerabilities detected${NC}"
