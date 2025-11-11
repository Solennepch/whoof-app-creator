# Security Testing with OWASP ZAP

This directory contains automated security tests using OWASP ZAP (Zed Attack Proxy) to detect common vulnerabilities.

## 🔒 Vulnerability Detection

The security tests scan for:

- **SQL Injection** - Attempts to inject malicious SQL queries
- **Cross-Site Scripting (XSS)** - Reflected, Persistent, and DOM-based XSS
- **Cross-Site Request Forgery (CSRF)** - Missing anti-CSRF tokens
- **Authentication Issues** - Weak session management, insecure cookies
- **Security Headers** - Missing CSP, X-Frame-Options, etc.
- **API Security** - Injection attacks, broken authentication

## 📋 Prerequisites

### Option 1: Docker (Recommended)

```bash
docker pull zaproxy/zap-stable
```

### Option 2: Local Installation

Download and install OWASP ZAP from [zaproxy.org/download](https://www.zaproxy.org/download/)

## 🚀 Running Security Tests

### Run All Security Tests

```bash
chmod +x tests/security/run-zap-scan.sh
./tests/security/run-zap-scan.sh
```

### Custom Target URL

```bash
TARGET_URL="https://your-app-url.com" ./tests/security/run-zap-scan.sh
```

### Docker Command

```bash
docker run --rm -v "$(pwd):/zap/wrk/:rw" \
  -t zaproxy/zap-stable \
  zap-baseline.py \
  -t "https://ozdaxhiqnfapfevdropz.supabase.co/functions/v1" \
  -r "tests/security/reports/zap-report.html" \
  -J "tests/security/reports/zap-report.json"
```

## 📊 Understanding Reports

### Risk Levels

- **🔴 High** - Critical vulnerabilities requiring immediate attention
- **🟡 Medium** - Significant security issues to fix soon
- **🔵 Low** - Minor issues or best practice violations
- **⚪ Info** - Informational findings

### Report Files

- `zap-report.html` - Human-readable HTML report
- `zap-report.json` - Machine-readable JSON for CI/CD
- `zap-report.md` - Markdown summary

## 🛡️ Common Vulnerabilities & Fixes

### SQL Injection

**Issue**: User input not sanitized before database queries

**Fix**: Always use Supabase client methods, never raw SQL
```typescript
// ✅ CORRECT
const { data } = await supabase.from('users').select().eq('id', userId);

// ❌ NEVER
await supabase.rpc('execute_sql', { query: `SELECT * FROM users WHERE id=${userId}` });
```

### Cross-Site Scripting (XSS)

**Issue**: User-generated content rendered without sanitization

**Fix**: Never use dangerouslySetInnerHTML, always escape user content
```typescript
// ✅ CORRECT
<p>{userInput}</p>

// ❌ NEVER
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### CSRF

**Issue**: Missing anti-CSRF tokens in forms

**Fix**: Supabase handles CSRF protection automatically. Ensure all mutations use Supabase SDK:
```typescript
// ✅ Supabase SDK provides CSRF protection
const { data } = await supabase.from('table').insert(values);
```

### Missing Security Headers

**Issue**: No Content-Security-Policy, X-Frame-Options, etc.

**Fix**: Add headers in edge functions:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'"
};
```

## 🔄 CI/CD Integration

Security tests run automatically on every push via GitHub Actions:

```yaml
- name: Security Scan
  run: ./tests/security/run-zap-scan.sh
  env:
    TARGET_URL: ${{ secrets.APP_URL }}
```

## 📚 Additional Resources

- [OWASP ZAP Documentation](https://www.zaproxy.org/docs/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)

## 🚨 Handling Security Issues

1. **Critical (High Risk)**: Fix immediately, do not deploy
2. **Important (Medium Risk)**: Fix within 1 week
3. **Minor (Low Risk)**: Fix in next sprint
4. **Informational**: Review and improve when possible

## 🔧 Troubleshooting

### ZAP Not Found

Install ZAP or use Docker:
```bash
docker pull zaproxy/zap-stable
```

### False Positives

Edit `zap-config.yaml` to adjust scanner sensitivity or exclude specific URLs:
```yaml
excludePaths:
  - "https://example.com/false-positive-url"
```

### Scan Takes Too Long

Reduce scan duration in `zap-config.yaml`:
```yaml
parameters:
  maxDuration: 5  # minutes
  maxDepth: 3     # crawl depth
```
