import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const swipeSuccessRate = new Rate('swipe_success');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp-up to 50 users
    { duration: '2m', target: 200 },   // Ramp-up to 200 users
    { duration: '2m', target: 200 },   // Stay at 200 users
    { duration: '1m', target: 500 },   // Spike to 500 users
    { duration: '1m', target: 500 },   // Stay at 500 users
    { duration: '1m', target: 0 },     // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<800', 'p(99)<1500'],
    http_req_failed: ['rate<0.05'],
    swipe_success: ['rate>0.85'], // 85% swipes should succeed
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://ozdaxhiqnfapfevdropz.supabase.co/functions/v1';
const ANON_KEY = __ENV.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZGF4aGlxbmZhcGZldmRyb3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0ODc2NjcsImV4cCI6MjA3NzA2MzY2N30.2NFz6vswkGWSJYIsI4pqc6Y1QgpgTjxtyDT2aPcRqTs';

const headers = {
  'Content-Type': 'application/json',
  'apikey': ANON_KEY,
};

export default function () {
  // Simulate swipe action
  const swipePayload = JSON.stringify({
    target_dog_id: `test-dog-${Math.floor(Math.random() * 1000)}`,
    direction: Math.random() > 0.5 ? 'right' : 'left',
  });

  const swipeRes = http.post(`${BASE_URL}/swipe`, swipePayload, { headers });
  
  const swipeSuccess = check(swipeRes, {
    'swipe status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'swipe response time < 800ms': (r) => r.timings.duration < 800,
  });
  
  swipeSuccessRate.add(swipeSuccess);
  errorRate.add(!swipeSuccess);

  sleep(1 + Math.random() * 2); // Random sleep between 1-3 seconds
}

export function handleSummary(data) {
  return {
    'tests/load/results/swipe-load-summary.json': JSON.stringify(data),
  };
}
