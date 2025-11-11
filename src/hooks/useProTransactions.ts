import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Transaction {
  id: string;
  pro_profile_id: string;
  booking_id?: string;
  user_id: string;
  amount: number;
  currency: string;
  type: 'payment' | 'refund' | 'payout' | 'subscription';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method?: string;
  stripe_payment_id?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

// Fetch transactions for a pro profile
export const useProTransactions = (proId?: string) => {
  return useQuery({
    queryKey: ['pro-transactions', proId],
    queryFn: async () => {
      if (!proId) return [];
      
      const { data, error } = await supabase
        .from('pro_transactions')
        .select(`
          *,
          profiles(display_name),
          pro_bookings(booking_date, pro_services(name))
        `)
        .eq('pro_profile_id', proId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!proId,
  });
};

// Calculate revenue stats
export const useRevenueStats = (proId?: string) => {
  return useQuery({
    queryKey: ['revenue-stats', proId],
    queryFn: async () => {
      if (!proId) return { total: 0, thisMonth: 0, lastMonth: 0, pending: 0 };
      
      const { data, error } = await supabase
        .from('pro_transactions')
        .select('amount, status, type, created_at')
        .eq('pro_profile_id', proId)
        .in('type', ['payment', 'payout']);

      if (error) throw error;

      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const stats = {
        total: 0,
        thisMonth: 0,
        lastMonth: 0,
        pending: 0
      };

      data?.forEach((transaction: any) => {
        const amount = parseFloat(transaction.amount);
        const transactionDate = new Date(transaction.created_at);

        if (transaction.status === 'completed' && transaction.type === 'payment') {
          stats.total += amount;

          if (transactionDate >= thisMonthStart) {
            stats.thisMonth += amount;
          } else if (transactionDate >= lastMonthStart && transactionDate <= lastMonthEnd) {
            stats.lastMonth += amount;
          }
        }

        if (transaction.status === 'pending') {
          stats.pending += amount;
        }
      });

      return stats;
    },
    enabled: !!proId,
  });
};
