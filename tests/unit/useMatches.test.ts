import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMatches } from '@/hooks/useMatches';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/lib/safeFetch';
import { ReactNode } from 'react';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

vi.mock('@/lib/safeFetch', () => ({
  safeFetch: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useMatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch matches successfully', async () => {
    const mockMatches = [
      { id: '1', a_user: 'user1', b_user: 'user2', status: 'matched' },
    ];

    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'user1' } },
    });

    const mockSelect = vi.fn().mockReturnThis();
    const mockOr = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({ data: mockMatches, error: null });

    (supabase.from as any).mockReturnValue({
      select: mockSelect,
      or: mockOr,
      eq: mockEq,
      order: mockOrder,
    });

    const { result } = renderHook(() => useMatches(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.matchesLoading).toBe(false);
    });

    expect(result.current.matches).toEqual(mockMatches);
  });

  it('should fetch suggested profiles successfully', async () => {
    const mockSuggested = [
      { id: '1', name: 'Max', breed: 'Labrador' },
    ];

    (safeFetch as any).mockResolvedValue(mockSuggested);

    const { result } = renderHook(() => useMatches(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.suggestedLoading).toBe(false);
    });

    expect(result.current.suggested).toEqual(mockSuggested);
  });

  it('should handle swipe action', async () => {
    const mockResponse = { match: true, message: "C'est un match !" };
    (safeFetch as any).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useMatches(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.suggestedLoading).toBe(false);
    });

    result.current.swipe({ to_user: 'user2', action: 'like' });

    await waitFor(() => {
      expect(result.current.isSwiping).toBe(false);
    });

    expect(safeFetch).toHaveBeenCalledWith(
      expect.stringContaining('/functions/v1/swipe'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ to_user: 'user2', action: 'like' }),
      })
    );
  });
});
