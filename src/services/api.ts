import api from "@/lib/api";

// Profile
export const getProfile = () => api.get("/profile");
export const updateProfile = (data: any) => api.put("/profile", data);

// Dogs
export const getMyDogs = () => api.get("/dog?owner=me");
export const getDog = (id: string) => api.get(`/dog/${id}`);
export const createDog = (data: any) => api.post("/dog", data);
export const updateDog = (id: string, data: any) => api.put(`/dog/${id}`, data);

// Subscription
export const checkSubscription = () => api.get("/check-subscription");

// Swipe
export const swipe = (data: { target_dog_id: string; direction: string }) => 
  api.post("/swipe", data);

// Suggested profiles
export const getSuggested = () => api.get("/suggested");

// Verify
export const requestVerification = () => api.post("/verify");
