// Mapbox public token configuration
// Get your public token from: https://account.mapbox.com/access-tokens/
// Public tokens (pk.*) are safe to use in client-side code

export const MAPBOX_PUBLIC_TOKEN = "pk.eyJ1Ijoic29sYXJvY2siLCJhIjoiY20yNmxkZHY1MDZzajJscXhhdXBvZ2Z5OSJ9.oCLQWZOtq4fwUvWDQ-yS9Q";

// You can also store it in localStorage for easy updates
export function getMapboxToken(): string {
  const storedToken = localStorage.getItem('mapbox_token');
  return storedToken || MAPBOX_PUBLIC_TOKEN;
}

export function setMapboxToken(token: string): void {
  localStorage.setItem('mapbox_token', token);
}
