import { ReactNode } from 'react';

interface FullScreenPageProps {
  children: ReactNode;
}

/**
 * Wrapper pour les pages qui doivent occuper tout l'écran sans scroll
 * Utilisé pour /discover et /map sur mobile
 */
export const FullScreenPage = ({ children }: FullScreenPageProps) => {
  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col">
      {children}
    </div>
  );
};
