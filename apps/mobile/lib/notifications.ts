import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { type Href, router } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { apiFetch } from "./api";

// --- 8.5: Foreground notification display config ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// --- 8.4: Register for push notifications and send token to API ---
async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device");
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push notification permission not granted");
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return tokenData.data;
}

async function sendTokenToApi(token: string) {
  const platform = Platform.OS === "ios" ? "ios" : "android";
  await apiFetch("/api/users/push-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, platform }),
  });
}

// --- 8.7: Deep linking — route to correct screen on notification tap ---
function handleNotificationResponse(response: Notifications.NotificationResponse) {
  const data = response.notification.request.content.data;
  if (data?.url && typeof data.url === "string") {
    router.push(data.url as Href);
  }
}

/**
 * Hook to register push notifications and handle deep links.
 * Call once in the root layout when the user is authenticated.
 */
export function usePushNotifications(isAuthenticated: boolean) {
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Register and send token to API
    registerForPushNotifications().then((token) => {
      if (token) {
        sendTokenToApi(token).catch((err) => console.error("Failed to register push token:", err));
      }
    });

    // Listen for notification taps (deep linking)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isAuthenticated]);
}
