import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DogMatchingScreen from "./DogMatchingScreen";

type DogProfile = {
  id: string;
  name: string;
  age: number;
  distanceKm?: number;
  shelterName?: string;
  photoUrl: string;
  shortDescription: string;
  badges?: string[];
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

  const localDogs: DogProfile[] = [
    {
      id: "1",
      name: "Nala",
      age: 2,
      distanceKm: 1.2,
      photoUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800",
      shortDescription: "adore jouer avec les autres chiens",
      badges: ["Sociable", "OK chiens", "Énergique"],
    },
    {
      id: "2",
      name: "Rocky",
      age: 5,
      distanceKm: 3.4,
      photoUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800",
      shortDescription: "parfait pour les balades tranquilles",
      badges: ["Calme", "OK enfants", "Marche en laisse"],
    },
    {
      id: "3",
      name: "Luna",
      age: 3,
      distanceKm: 0.8,
      photoUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800",
      shortDescription: "partenaire idéale pour courir",
      badges: ["Sportive", "Randonnée", "Obéissante"],
    },
  ];

  const adoptionDogs: DogProfile[] = [
    {
      id: "4",
      name: "Moka",
      age: 4,
      shelterName: "SPA de Lyon",
      photoUrl: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800",
      shortDescription: "8 mois au refuge",
      badges: ["Adoption urgente", "Très affectueux", "Stérilisé"],
    },
    {
      id: "5",
      name: "Pixel",
      age: 1,
      shelterName: "SPA de Marseille",
      photoUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800",
      shortDescription: "besoin de douceur",
      badges: ["Timide", "Progrès en cours", "OK congénères"],
    },
    {
      id: "6",
      name: "Gaston",
      age: 9,
      shelterName: "SPA de Toulouse",
      photoUrl: "https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=800",
      shortDescription: "chien senior",
      badges: ["Senior", "Très calme", "Propre"],
    },
  ];

  const dogs = mode === "local" ? localDogs : adoptionDogs;

  return <DogMatchingScreen mode={mode} dogs={dogs} />;
}
