import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMessages } from '@/hooks/useMessages';
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

const mockThreadData = [
  {
    id: 'thread-1',
    a: 'user-123',
    b: 'user-456',
    created_at: '2024-01-01T10:00:00Z',
    messages: [
      {
        id: 'msg-1',
        thread_id: 'thread-1',
        sender_id: 'user-456',
        body: 'Hello!',
        created_at: '2024-01-01T10:00:00Z',
      },
    ],
  },
];

const mockMessageData = [
  {
    id: 'msg-1',
    thread_id: 'thread-1',
    sender_id: 'user-456',
    body: 'Hello!',
    created_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'msg-2',
    thread_id: 'thread-1',
    sender_id: 'user-123',
    body: 'Hi there!',
    created_at: '2024-01-01T10:01:00Z',
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

describe('useMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch threads successfully', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'user-123' } as any },
      error: null,
    });

    const mockSelect = vi.fn().mockReturnThis();
    const mockOr = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({ data: mockThreadData, error: null });

    // First call for threads
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: mockSelect,
      or: mockOr,
      order: mockOrder,
    } as any);

    // Second call for profile
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'user-456',
          display_name: 'Jane Doe',
          avatar_url: 'avatar.jpg',
        },
        error: null,
      }),
    } as any);

    const { result } = renderHook(() => useMessages(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.threadsLoading).toBe(false));
    expect(result.current.threads).toHaveLength(1);
    expect(result.current.threads?.[0].otherUser?.display_name).toBe('Jane Doe');
  });

  it('should fetch thread messages successfully', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({ data: mockMessageData, error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
    } as any);

    const { result } = renderHook(() => useMessages(), {
      wrapper: createWrapper(),
    });

    const { result: messagesResult } = renderHook(
      () => result.current.useThreadMessages('thread-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(messagesResult.current.isSuccess).toBe(true));
    expect(messagesResult.current.data).toEqual(mockMessageData);
  });

  it('should send message to existing thread', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'user-123' } as any },
      error: null,
    });

    const mockInsert = vi.fn().mockReturnThis();
    const mockSelect = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'msg-3',
        thread_id: 'thread-1',
        sender_id: 'user-123',
        body: 'Test message',
      },
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      insert: mockInsert,
      select: mockSelect,
      single: mockSingle,
    } as any);

    const { result } = renderHook(() => useMessages(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => result.current.sendMessage);

    result.current.sendMessage({
      threadId: 'thread-1',
      receiverId: 'user-456',
      content: 'Test message',
    });

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith({
        thread_id: 'thread-1',
        sender_id: 'user-123',
        body: 'Test message',
      });
    });
  });

  it('should create new thread and send message', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'user-123' } as any },
      error: null,
    });

    // Mock checking for existing thread (not found)
    const mockSelectThread = vi.fn().mockReturnThis();
    const mockOrThread = vi.fn().mockReturnThis();
    const mockSingleThread = vi.fn().mockResolvedValue({ data: null, error: null });

    vi.mocked(supabase.from).mockReturnValueOnce({
      select: mockSelectThread,
      or: mockOrThread,
      single: mockSingleThread,
    } as any);

    // Mock creating new thread
    const mockInsertThread = vi.fn().mockReturnThis();
    const mockSelectNewThread = vi.fn().mockReturnThis();
    const mockSingleNewThread = vi.fn().mockResolvedValue({
      data: { id: 'thread-new', a: 'user-123', b: 'user-789' },
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValueOnce({
      insert: mockInsertThread,
      select: mockSelectNewThread,
      single: mockSingleNewThread,
    } as any);

    // Mock sending message
    const mockInsertMsg = vi.fn().mockReturnThis();
    const mockSelectMsg = vi.fn().mockReturnThis();
    const mockSingleMsg = vi.fn().mockResolvedValue({
      data: { id: 'msg-new', body: 'First message' },
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValueOnce({
      insert: mockInsertMsg,
      select: mockSelectMsg,
      single: mockSingleMsg,
    } as any);

    const { result } = renderHook(() => useMessages(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => result.current.sendMessage);

    result.current.sendMessage({
      receiverId: 'user-789',
      content: 'First message',
    });

    await waitFor(() => {
      expect(mockInsertThread).toHaveBeenCalledWith({ a: 'user-123', b: 'user-789' });
    });
  });

  it('should handle send message errors', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'user-123' } as any },
      error: null,
    });

    const mockInsert = vi.fn().mockReturnThis();
    const mockSelect = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: new Error('Database error'),
    });

    vi.mocked(supabase.from).mockReturnValue({
      insert: mockInsert,
      select: mockSelect,
      single: mockSingle,
    } as any);

    const { result } = renderHook(() => useMessages(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => result.current.sendMessage);

    result.current.sendMessage({
      threadId: 'thread-1',
      receiverId: 'user-456',
      content: 'Test message',
    });

    await waitFor(() => {
      expect(result.current.isSending).toBe(false);
    });
  });

  it('should return empty array when threadId is undefined', async () => {
    const { result } = renderHook(() => useMessages(), {
      wrapper: createWrapper(),
    });

    const { result: messagesResult } = renderHook(
      () => result.current.useThreadMessages(undefined),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(messagesResult.current.data).toEqual([]);
    });
  });
});
