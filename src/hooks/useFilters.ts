import { useState, useCallback } from 'react';
import { DEFAULT_DISTANCE } from '@/config/filters';

export interface Filters {
  distance: number;
  ages: string[];
  sizes: string[];
  temperaments: string[];
  breeds: string[];
}

export const useFilters = () => {
  const [filters, setFilters] = useState<Filters>({
    distance: DEFAULT_DISTANCE,
    ages: [],
    sizes: [],
    temperaments: [],
    breeds: [],
  });

  const updateFilters = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      distance: DEFAULT_DISTANCE,
      ages: [],
      sizes: [],
      temperaments: [],
      breeds: [],
    });
  }, []);

  const hasActiveFilters = 
    filters.distance !== DEFAULT_DISTANCE ||
    filters.ages.length > 0 ||
    filters.sizes.length > 0 ||
    filters.temperaments.length > 0 ||
    filters.breeds.length > 0;

  return {
    filters,
    updateFilters,
    resetFilters,
    hasActiveFilters,
  };
};
