import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWalks } from '@/hooks/useWalks';
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

const mockWalkData = [
  {
    id: 'walk-1',
    user_id: 'user-123',
    dog_id: 'dog-1',
    status: 'completed',
    mood: 'happy',
    start_at: '2024-01-01T10:00:00Z',
    end_at: '2024-01-01T11:00:00Z',
    start_location: { lat: 48.8566, lng: 2.3522 },
    route: [],
    distance_km: 2.5,
    duration_minutes: 60,
    friends_notified: false,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T11:00:00Z',
  },
];

const mockEventData = [
  {
    id: 'event-1',
    host_id: 'user-123',
    title: 'Balade au parc',
    starts_at: '2024-12-25T14:00:00Z',
    place_name: 'Parc des Buttes-Chaumont',
    place_point: { lat: 48.8799, lng: 2.3828 },
    capacity: 10,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
    host: { display_name: 'John Doe', avatar_url: 'avatar.jpg' },
    participants: [],
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

describe('useWalks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch user walks successfully', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'user-123' } as any },
      error: null,
    });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({ data: mockWalkData, error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
    } as any);

    const { result } = renderHook(() => useWalks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.walksLoading).toBe(false));
    expect(result.current.myWalks).toEqual(mockWalkData);
  });

  it('should fetch walk events successfully', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockGte = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({ data: mockEventData, error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      gte: mockGte,
      order: mockOrder,
    } as any);

    const { result } = renderHook(() => useWalks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.eventsLoading).toBe(false));
    expect(result.current.events).toEqual(mockEventData);
  });

  it('should start a walk successfully', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'user-123' } as any },
      error: null,
    });

    const mockInsert = vi.fn().mockReturnThis();
    const mockSelect = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: { id: 'new-walk', status: 'ongoing' },
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      insert: mockInsert,
      select: mockSelect,
      single: mockSingle,
    } as any);

    const { result } = renderHook(() => useWalks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => result.current.startWalk);

    result.current.startWalk({ dogId: 'dog-1', mood: 'happy' });

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          dog_id: 'dog-1',
          mood: 'happy',
          status: 'ongoing',
        })
      );
    });
  });

  it('should end a walk successfully', async () => {
    const mockUpdate = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSelect = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: { id: 'walk-1', status: 'completed' },
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      update: mockUpdate,
      eq: mockEq,
      select: mockSelect,
      single: mockSingle,
    } as any);

    const { result } = renderHook(() => useWalks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => result.current.endWalk);

    result.current.endWalk('walk-1');

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'completed',
          end_at: expect.any(String),
        })
      );
    });
  });

  it('should create walk event successfully', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'user-123' } as any },
      error: null,
    });

    const mockInsert = vi.fn().mockReturnThis();
    const mockSelect = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: { id: 'event-1', title: 'Test Event' },
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      insert: mockInsert,
      select: mockSelect,
      single: mockSingle,
    } as any);

    const { result } = renderHook(() => useWalks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => result.current.createEvent);

    result.current.createEvent({
      title: 'Test Event',
      starts_at: '2024-12-25T14:00:00Z',
      place_name: 'Test Park',
      capacity: 10,
    });

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          host_id: 'user-123',
          title: 'Test Event',
        })
      );
    });
  });

  it('should join walk event successfully', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'user-123' } as any },
      error: null,
    });

    const mockInsert = vi.fn().mockReturnThis();
    const mockSelect = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: { event_id: 'event-1', user_id: 'user-123' },
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      insert: mockInsert,
      select: mockSelect,
      single: mockSingle,
    } as any);

    const { result } = renderHook(() => useWalks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => result.current.joinEvent);

    result.current.joinEvent('event-1');

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith({
        event_id: 'event-1',
        user_id: 'user-123',
      });
    });
  });

  it('should handle authentication errors', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated'),
    });

    const { result } = renderHook(() => useWalks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.myWalks).toBeUndefined();
    });
  });
});
