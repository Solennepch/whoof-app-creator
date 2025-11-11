import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useProBookings,
  useMyBookings,
  useCreateBooking,
  useUpdateBookingStatus,
  useProAvailability,
} from '@/hooks/useProBookings';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockBookingData = [
  {
    id: 'booking-1',
    pro_profile_id: 'pro-123',
    service_id: 'service-1',
    user_id: 'user-456',
    booking_date: '2024-12-25',
    start_time: '14:00',
    end_time: '15:00',
    status: 'confirmed',
    notes: 'Test booking',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
    pro_services: { name: 'Toilettage', price: 50 },
    profiles: { display_name: 'John Doe', avatar_url: 'avatar.jpg' },
  },
];

const mockAvailabilityData = [
  {
    id: 'avail-1',
    pro_profile_id: 'pro-123',
    day_of_week: 1,
    start_time: '09:00',
    end_time: '18:00',
    is_active: true,
    created_at: '2024-01-01T10:00:00Z',
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useProBookings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch pro bookings successfully', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({ data: mockBookingData, error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
    } as any);

    const { result } = renderHook(() => useProBookings('pro-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockBookingData);
  });

  it('should return empty array when proId is undefined', async () => {
    const { result } = renderHook(() => useProBookings(undefined), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([]);
    });
  });

  it('should fetch user bookings successfully', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'user-456' } as any },
      error: null,
    });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({ data: mockBookingData, error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
    } as any);

    const { result } = renderHook(() => useMyBookings(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockBookingData);
  });

  it('should create booking successfully', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'user-456' } as any },
      error: null,
    });

    const mockInsert = vi.fn().mockReturnThis();
    const mockSelect = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: mockBookingData[0],
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      insert: mockInsert,
      select: mockSelect,
      single: mockSingle,
    } as any);

    const { result } = renderHook(() => useCreateBooking(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      pro_profile_id: 'pro-123',
      service_id: 'service-1',
      booking_date: '2024-12-25',
      start_time: '14:00',
      end_time: '15:00',
      notes: 'Test booking',
    });

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          pro_profile_id: 'pro-123',
          service_id: 'service-1',
          user_id: 'user-456',
        }),
      ]);
    });
  });

  it('should handle create booking authentication error', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated'),
    });

    const { result } = renderHook(() => useCreateBooking(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      pro_profile_id: 'pro-123',
      service_id: 'service-1',
      booking_date: '2024-12-25',
      start_time: '14:00',
      end_time: '15:00',
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('should update booking status successfully', async () => {
    const mockUpdate = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSelect = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: { ...mockBookingData[0], status: 'completed' },
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      update: mockUpdate,
      eq: mockEq,
      select: mockSelect,
      single: mockSingle,
    } as any);

    const { result } = renderHook(() => useUpdateBookingStatus(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      id: 'booking-1',
      status: 'completed',
    });

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'completed' });
      expect(mockEq).toHaveBeenCalledWith('id', 'booking-1');
    });
  });

  it('should fetch pro availability successfully', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({ data: mockAvailabilityData, error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
    } as any);

    const { result } = renderHook(() => useProAvailability('pro-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockAvailabilityData);
  });

  it('should handle database errors gracefully', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({
      data: null,
      error: new Error('Database error'),
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
    } as any);

    const { result } = renderHook(() => useProBookings('pro-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
