import { useState } from "react";
import { Heart, Shield, Calendar, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDogAge } from "@/utils/age";
import { getZodiacSign, getZodiacEmoji } from "@/utils/zodiac";

interface DogCardProps {
  dog: {
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
  };
  isOwner?: boolean;
  onLike?: () => void;
  onMessage?: () => void;
}

export function DogCard({ dog, isOwner, onLike, onMessage }: DogCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Calculate age from birthdate or use age_years
  const ageDisplay = dog.birthdate 
    ? formatDogAge(dog.birthdate)
    : dog.age_years 
    ? `${dog.age_years} an${dog.age_years > 1 ? 's' : ''}`
    : "Âge inconnu";

  // Get zodiac sign from API or calculate if birthdate exists
  const zodiacSign = dog.zodiac_sign || (dog.birthdate ? getZodiacSign(dog.birthdate) : null);
  const zodiacEmoji = zodiacSign ? getZodiacEmoji(zodiacSign as any) : null;

  // Map English zodiac signs from API to French
  const zodiacDisplayMap: Record<string, string> = {
    'Aries': 'Bélier',
    'Taurus': 'Taureau',
    'Gemini': 'Gémeaux',
    'Cancer': 'Cancer',
    'Leo': 'Lion',
    'Virgo': 'Vierge',
    'Libra': 'Balance',
    'Scorpio': 'Scorpion',
    'Sagittarius': 'Sagittaire',
    'Capricorn': 'Capricorne',
    'Aquarius': 'Verseau',
    'Pisces': 'Poissons',
  };

  const zodiacDisplay = zodiacSign ? zodiacDisplayMap[zodiacSign] || zodiacSign : null;

  // Check vaccination status
  const isVaccinated = dog.vaccination && 
    (dog.vaccination.rabies || dog.vaccination.dhpp || dog.vaccination.bordetella);

  return (
    <>
      <Card className="overflow-hidden rounded-3xl shadow-lg border-0">
        {/* Dog Image */}
        <div 
          className="relative h-80 bg-gradient-to-br from-pink-200 via-purple-200 to-rose-200"
          style={{
            backgroundImage: dog.avatar_url ? `url(${dog.avatar_url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {!dog.avatar_url && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-8xl">🐕</span>
            </div>
          )}
          
          {/* Vaccination Badge */}
          {isVaccinated && (
            <div className="absolute top-4 right-4">
              <Badge 
                className="bg-green-500 text-white border-0 shadow-lg gap-1"
              >
                <Shield className="h-3 w-3" />
                Vacciné
              </Badge>
            </div>
          )}
        </div>

        {/* Dog Info */}
        <div className="p-6 space-y-4">
          {/* Name and Zodiac */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold" style={{ color: "var(--ink)", fontFamily: "Fredoka" }}>
                {dog.name}
              </h2>
              {dog.breed && (
                <p className="text-lg text-muted-foreground mt-1">{dog.breed}</p>
              )}
            </div>
            {zodiacDisplay && zodiacEmoji && (
              <Badge variant="outline" className="text-lg gap-1">
                {zodiacEmoji} {zodiacDisplay}
              </Badge>
            )}
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50">
              <p className="text-xs text-muted-foreground">Âge</p>
              <p className="font-semibold flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {ageDisplay}
              </p>
            </div>

            {dog.size && (
              <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50">
                <p className="text-xs text-muted-foreground">Taille</p>
                <p className="font-semibold capitalize">{dog.size}</p>
              </div>
            )}

            {dog.temperament && (
              <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-50 to-purple-50 col-span-2">
                <p className="text-xs text-muted-foreground">Tempérament</p>
                <p className="font-semibold capitalize">{dog.temperament}</p>
              </div>
            )}
          </div>

          {/* Anecdote */}
          {dog.anecdote && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200">
              <p className="text-sm italic text-gray-700">
                💭 "{dog.anecdote}"
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="rounded-2xl gap-2 flex-1"
                >
                  <Info className="h-4 w-4" />
                  Voir plus d'infos
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl" style={{ fontFamily: "Fredoka" }}>
                    {dog.name} 🐾
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={dog.avatar_url} />
                      <AvatarFallback className="text-4xl bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                        🐕
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="space-y-3">
                    {dog.breed && (
                      <div>
                        <p className="text-sm text-muted-foreground">Race</p>
                        <p className="font-medium">{dog.breed}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Âge</p>
                      <p className="font-medium">{ageDisplay}</p>
                    </div>

                    {dog.size && (
                      <div>
                        <p className="text-sm text-muted-foreground">Taille</p>
                        <p className="font-medium capitalize">{dog.size}</p>
                      </div>
                    )}

                    {dog.temperament && (
                      <div>
                        <p className="text-sm text-muted-foreground">Tempérament</p>
                        <p className="font-medium capitalize">{dog.temperament}</p>
                      </div>
                    )}

                    {zodiacDisplay && (
                      <div>
                        <p className="text-sm text-muted-foreground">Signe astrologique</p>
                        <p className="font-medium">{zodiacEmoji} {zodiacDisplay}</p>
                      </div>
                    )}

                    {isVaccinated && (
                      <div>
                        <p className="text-sm text-muted-foreground">Vaccination</p>
                        <div className="flex gap-2 flex-wrap mt-1">
                          {dog.vaccination?.rabies && (
                            <Badge variant="outline" className="gap-1">
                              <Shield className="h-3 w-3" />
                              Rage
                            </Badge>
                          )}
                          {dog.vaccination?.dhpp && (
                            <Badge variant="outline" className="gap-1">
                              <Shield className="h-3 w-3" />
                              DHPP
                            </Badge>
                          )}
                          {dog.vaccination?.bordetella && (
                            <Badge variant="outline" className="gap-1">
                              <Shield className="h-3 w-3" />
                              Bordetella
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {!isOwner && onLike && (
              <Button 
                onClick={onLike}
                className="rounded-2xl gap-2"
                style={{ backgroundColor: "var(--brand-raspberry)" }}
              >
                <Heart className="h-4 w-4" />
                J'aime
              </Button>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}
