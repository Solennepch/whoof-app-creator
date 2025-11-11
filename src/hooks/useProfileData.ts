import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { safeFetch } from '@/lib/safeFetch';
import { cache } from '@/lib/cache';

interface Dog {
  id: string;
  name: string;
  breed?: string;
  age_years?: number;
  birthdate?: string;
  temperament?: string;
  size?: string;
  avatar_url?: string;
  vaccination?: any;
  anecdote?: string;
  zodiac_sign?: string;
}

interface Profile {
  id: string;
  display_name?: string;
  avatar_url?: string;
  birth_date?: string;
  bio?: string;
  gender?: string;
  relationship_status?: string;
  interests?: string[];
  human_verified?: boolean;
}

function isValidUUID(str: string): boolean {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(str);
}

export const useProfileData = (id?: string) => {
  const navigate = useNavigate();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isPro, setIsPro] = useState(false);

  const fetchProfileData = async () => {
    if (!id) {
      navigate('/profile/me', { replace: true });
      return;
    }

    if (!isValidUUID(id)) {
      navigate('/profile/me', { replace: true });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;
      
      // Try to get from cache first
      const data = await cache.getOrSet(
        cache.profileKey(id),
        async () => {
          return await safeFetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/profile/${id}`);
        },
        { type: 'profile' }
      );

      if (!data?.profile) {
        setError(new Error('Profil non trouvé'));
        setIsLoading(false);
        return;
      }

      setProfile(data.profile);
      setDogs(data.dogs || []);
      setIsOwnProfile(currentUserId === id);

      if (currentUserId === id && user) {
        const { data: proAccount } = await supabase
          .from('pro_accounts')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        setIsPro(!!proAccount);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      
      if (err instanceof Error && err.message.includes('404')) {
        setError(new Error('Profil non trouvé'));
      } else {
        setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  return {
    dogs,
    profile,
    isLoading,
    error,
    isOwnProfile,
    isPro,
    refetch: fetchProfileData,
  };
};
