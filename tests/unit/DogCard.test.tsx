import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DogCard } from '@/components/profile/DogCard';

describe('DogCard', () => {
  const mockDog = {
    id: '1',
    name: 'Max',
    breed: 'Labrador',
    age_years: 3,
    temperament: 'friendly',
    size: 'large',
    avatar_url: 'https://example.com/max.jpg',
    vaccination: {
      rabies: true,
      dhpp: true,
      bordetella: false,
    },
    anecdote: 'Loves to play fetch!',
    zodiac_sign: 'Leo',
  };

  it('should render dog name and breed', () => {
    render(<DogCard dog={mockDog} />);

    expect(screen.getByText('Max')).toBeInTheDocument();
    expect(screen.getByText('Labrador')).toBeInTheDocument();
  });

  it('should display age correctly', () => {
    render(<DogCard dog={mockDog} />);

    expect(screen.getByText('3 ans')).toBeInTheDocument();
  });

  it('should display vaccination badge when vaccinated', () => {
    render(<DogCard dog={mockDog} />);

    expect(screen.getByText('Vacciné')).toBeInTheDocument();
  });

  it('should not display vaccination badge when not vaccinated', () => {
    const unvaccinatedDog = {
      ...mockDog,
      vaccination: null,
    };

    render(<DogCard dog={unvaccinatedDog} />);

    expect(screen.queryByText('Vacciné')).not.toBeInTheDocument();
  });

  it('should display zodiac sign', () => {
    render(<DogCard dog={mockDog} />);

    expect(screen.getByText(/Lion/)).toBeInTheDocument();
  });

  it('should display anecdote', () => {
    render(<DogCard dog={mockDog} />);

    expect(screen.getByText(/Loves to play fetch!/)).toBeInTheDocument();
  });

  it('should display size and temperament', () => {
    render(<DogCard dog={mockDog} />);

    expect(screen.getByText('large')).toBeInTheDocument();
    expect(screen.getByText('friendly')).toBeInTheDocument();
  });

  it('should call onLike when like button is clicked', () => {
    const onLike = vi.fn();
    render(<DogCard dog={mockDog} isOwner={false} onLike={onLike} />);

    const likeButton = screen.getByRole('button', { name: /j'aime/i });
    fireEvent.click(likeButton);

    expect(onLike).toHaveBeenCalledTimes(1);
  });

  it('should not display like button when isOwner is true', () => {
    render(<DogCard dog={mockDog} isOwner={true} />);

    expect(screen.queryByRole('button', { name: /j'aime/i })).not.toBeInTheDocument();
  });

  it('should open details dialog when "Voir plus d\'infos" is clicked', () => {
    render(<DogCard dog={mockDog} />);

    const detailsButton = screen.getByRole('button', { name: /voir plus d'infos/i });
    fireEvent.click(detailsButton);

    // Dialog should now be open and show additional details
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should display age from birthdate if provided', () => {
    const dogWithBirthdate = {
      ...mockDog,
      age_years: undefined,
      birthdate: '2021-06-15',
    };

    render(<DogCard dog={dogWithBirthdate} />);

    // Age calculation is done by formatDogAge utility
    // Just verify it displays something
    expect(screen.getByText(/an/)).toBeInTheDocument();
  });

  it('should display "Âge inconnu" when no age or birthdate', () => {
    const dogWithoutAge = {
      ...mockDog,
      age_years: undefined,
      birthdate: undefined,
    };

    render(<DogCard dog={dogWithoutAge} />);

    expect(screen.getByText('Âge inconnu')).toBeInTheDocument();
  });
});
