import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DogIcon, Edit } from 'lucide-react';

interface Dog {
  id: string;
  name: string;
  avatar_url?: string;
}

interface Profile {
  human_verified?: boolean;
}

interface ProfileHeaderProps {
  primaryDog?: Dog;
  profile: Profile;
  completionPercentage: number;
}

export function ProfileHeader({ primaryDog, profile, completionPercentage }: ProfileHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="relative">
        <div className="relative w-24 h-24">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="48" cy="48" r="44" fill="none" stroke="#E5E7EB" strokeWidth="4" />
            <circle
              cx="48"
              cy="48"
              r="44"
              fill="none"
              stroke="#FF5DA2"
              strokeWidth="4"
              strokeDasharray={`${(completionPercentage / 100) * 276.46} 276.46`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          
          <div className="absolute inset-2 rounded-full overflow-hidden bg-white">
            {primaryDog?.avatar_url ? (
              <img 
                src={primaryDog.avatar_url} 
                alt={primaryDog.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7B61FF] to-[#FF5DA2]">
                <DogIcon className="w-10 h-10 text-white" />
              </div>
            )}
          </div>

          <div 
            className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
            style={{ backgroundColor: "#FF5DA2" }}
          >
            {completionPercentage}%
          </div>
        </div>
      </div>

      <div className="flex-1 ml-4">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-foreground">
            {primaryDog?.name || "Mon chien"}
          </h1>
          {profile.human_verified && (
            <div className="w-6 h-6 rounded-full bg-[#7B61FF] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        
        <Button
          onClick={() => navigate('/profile/me')}
          variant="outline"
          className="rounded-full font-medium text-sm h-10 px-6 border-2"
          style={{ borderColor: "#111827" }}
        >
          <Edit className="w-4 h-4 mr-2" />
          Modifier mon profil
        </Button>
      </div>
    </div>
  );
}
