import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DogMatchingScreen from "./DogMatchingScreen";
import { regionProfiles, adoptionProfiles } from "@/config/profiles";

type DogProfile = {
  id: string;
  name: string;
  age: number;
  distanceKm?: number;
  shelterName?: string;
  photoUrl: string;
  shortDescription: string;
  badges?: string[];
  ownerName?: string;
};

export default function Discover() {
  const location = useLocation();
  const [mode, setMode] = useState<"local" | "adoption">("local");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlMode = searchParams.get('mode');
    
    if (urlMode === 'adoption') {
      setMode('adoption');
    } else {
      setMode('local');
    }
  }, [location.search]);

  const localDogs: DogProfile[] = regionProfiles.map((profile, index) => ({
    id: `local-${index + 1}`,
    name: profile.name,
    age: parseInt(profile.age),
    distanceKm: Math.round((Math.random() * 4 + 0.5) * 10) / 10,
    photoUrl: profile.image,
    shortDescription: profile.bio,
    badges: profile.reasons,
    ownerName: ["Sophie", "Thomas", "Marie", "Lucas", "Emma", "Hugo", "Léa", "Noah", "Chloé", "Louis"][index % 10],
  }));

  const adoptionDogs: DogProfile[] = adoptionProfiles.map((profile, index) => ({
    id: `adoption-${index + 1}`,
    name: profile.name,
    age: parseInt(profile.age.split(" ")[0]),
    shelterName: profile.shelter,
    photoUrl: profile.image,
    shortDescription: profile.bio,
    badges: profile.reasons,
  }));

  const dogs = mode === "local" ? localDogs : adoptionDogs;

  return <DogMatchingScreen mode={mode} dogs={dogs} />;
}
