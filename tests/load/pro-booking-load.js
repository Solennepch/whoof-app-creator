import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const bookingCreationRate = new Rate('booking_creation');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 50 },    // Warm-up
    { duration: '2m', target: 150 },   // Normal load
    { duration: '1m', target: 300 },   // Peak load
    { duration: '2m', target: 300 },   // Sustained peak
    { duration: '1m', target: 0 },     // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.08'],
    booking_creation: ['rate>0.75'], // 75% booking attempts should succeed
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://ozdaxhiqnfapfevdropz.supabase.co/functions/v1';
const ANON_KEY = __ENV.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZGF4aGlxbmZhcGZldmRyb3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0ODc2NjcsImV4cCI6MjA3NzA2MzY2N30.2NFz6vswkGWSJYIsI4pqc6Y1QgpgTjxtyDT2aPcRqTs';

const headers = {
  'Content-Type': 'application/json',
  'apikey': ANON_KEY,
};

export default function () {
  // Test 1: Get pro directory
  const directoryRes = http.get(`${BASE_URL}/pro-directory`, { headers });
  
  check(directoryRes, {
    'directory status is 200': (r) => r.status === 200,
    'directory response time < 1000ms': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: Get pro public profile
  const proPublicRes = http.get(`${BASE_URL}/pro-public?id=test-pro-${Math.floor(Math.random() * 100)}`, { headers });
  
  check(proPublicRes, {
    'pro public status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    'pro public response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // Test 3: Create booking (requires auth, will likely fail but tests the endpoint)
  const bookingPayload = JSON.stringify({
    pro_profile_id: `test-pro-${Math.floor(Math.random() * 100)}`,
    service_id: `test-service-${Math.floor(Math.random() * 10)}`,
    booking_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    start_time: '10:00',
    end_time: '11:00',
    notes: 'Load test booking',
  });

  const bookingRes = http.post(`${BASE_URL}/create-booking-payment`, bookingPayload, { headers });
  
  const bookingSuccess = check(bookingRes, {
    'booking status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'booking response time < 1500ms': (r) => r.timings.duration < 1500,
  });

  bookingCreationRate.add(bookingSuccess && bookingRes.status === 200);
  errorRate.add(!bookingSuccess);

  sleep(2);
}

export function handleSummary(data) {
  return {
    'tests/load/results/pro-booking-load-summary.json': JSON.stringify(data),
  };
}
