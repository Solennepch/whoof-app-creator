import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 100 },   // Ramp-up to 100 users
    { duration: '3m', target: 100 },   // Stay at 100 users
    { duration: '1m', target: 500 },   // Ramp-up to 500 users
    { duration: '3m', target: 500 },   // Stay at 500 users
    { duration: '1m', target: 1000 },  // Spike to 1000 users
    { duration: '2m', target: 1000 },  // Stay at 1000 users
    { duration: '2m', target: 0 },     // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% under 500ms, 99% under 1s
    http_req_failed: ['rate<0.05'], // Less than 5% errors
    errors: ['rate<0.1'], // Less than 10% custom errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://ozdaxhiqnfapfevdropz.supabase.co/functions/v1';
const ANON_KEY = __ENV.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZGF4aGlxbmZhcGZldmRyb3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0ODc2NjcsImV4cCI6MjA3NzA2MzY2N30.2NFz6vswkGWSJYIsI4pqc6Y1QgpgTjxtyDT2aPcRqTs';

const headers = {
  'Content-Type': 'application/json',
  'apikey': ANON_KEY,
};

export default function () {
  // Test 1: Profile endpoint
  const profileRes = http.get(`${BASE_URL}/profile`, { headers });
  
  check(profileRes, {
    'profile status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'profile response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: Suggested profiles endpoint
  const suggestedRes = http.get(`${BASE_URL}/suggested`, { headers });
  
  check(suggestedRes, {
    'suggested status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'suggested response time < 1000ms': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(1);

  // Test 3: Check subscription endpoint
  const subscriptionRes = http.get(`${BASE_URL}/check-subscription`, { headers });
  
  check(subscriptionRes, {
    'subscription status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'subscription response time < 300ms': (r) => r.timings.duration < 300,
  }) || errorRate.add(1);

  sleep(2);
}

export function handleSummary(data) {
  return {
    'tests/load/results/auth-load-summary.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  let summary = `\n${indent}Test Summary:\n`;
  summary += `${indent}  Total Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += `${indent}  Failed Requests: ${data.metrics.http_req_failed.values.passes}\n`;
  summary += `${indent}  Request Duration (avg): ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += `${indent}  Request Duration (p95): ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += `${indent}  Request Duration (p99): ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n`;
  summary += `${indent}  Error Rate: ${(data.metrics.errors?.values.rate * 100 || 0).toFixed(2)}%\n`;
  
  return summary;
}
