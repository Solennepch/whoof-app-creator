export async function ensureServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service workers not supported");
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("Service worker registered:", registration);
    return registration;
  } catch (error) {
    console.error("Service worker registration failed:", error);
    return null;
  }
}

export async function subscribePush(vapidPublicKey: string) {
  const reg = await ensureServiceWorker();
  if (!reg) return null;

  try {
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    });
    
    console.log("Push subscription created:", subscription);
    return subscription.toJSON();
  } catch (error) {
    console.error("Push subscription failed:", error);
    return null;
  }
}

export async function unsubscribePush() {
  const reg = await navigator.serviceWorker.ready;
  const subscription = await reg.pushManager.getSubscription();
  
  if (subscription) {
    await subscription.unsubscribe();
    return subscription.toJSON();
  }
  
  return null;
}

export async function getCurrentSubscription() {
  if (!("serviceWorker" in navigator)) return null;
  
  try {
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    return subscription ? subscription.toJSON() : null;
  } catch (error) {
    console.error("Error getting current subscription:", error);
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
