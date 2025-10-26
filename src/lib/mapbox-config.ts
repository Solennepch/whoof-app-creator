// Mapbox public token configuration
// Get your public token from: https://account.mapbox.com/access-tokens/
// Public tokens (pk.*) are safe to use in client-side code

export const MAPBOX_PUBLIC_TOKEN = "pk.eyJ1Ijoic29sZW5uZXBjaCIsImEiOiJjbWg4OW81cDUxMGxrMmpzZDJuZjE2bHo5In0.q3iELgWbCe0OlDtEL4EztQ";

// You can also store it in localStorage for easy updates
export function getMapboxToken(): string {
  const storedToken = localStorage.getItem('mapbox_token');
  return storedToken || MAPBOX_PUBLIC_TOKEN;
}

export function setMapboxToken(token: string): void {
  localStorage.setItem('mapbox_token', token);
}
