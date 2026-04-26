// services/notifications.js
import Constants from "expo-constants";
import { Platform } from "react-native";

const IS_EXPO_GO = Constants.appOwnership === "expo";

const getNotifications = () => {
  if (IS_EXPO_GO) return null;
  try { return require("expo-notifications"); } catch { return null; }
};

if (!IS_EXPO_GO) {
  try {
    const N = require("expo-notifications");
    N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch {}
}

export const registerForPushNotifications = async () => {
  if (IS_EXPO_GO) return null;
  const N = getNotifications();
  if (!N) return null;
  try {
    const { status: existing } = await N.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== "granted") {
      const { status } = await N.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") return null;

    if (Platform.OS === "android") {
      await N.setNotificationChannelAsync("default", {
        name: "PanditConnect",
        importance: N.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#C17F24",
        sound: "default",
      });
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;
    const tokenData = await N.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    return tokenData.data;
  } catch (err) {
    console.error("[PUSH] Registration error:", err.message);
    return null;
  }
};

export const subscribeToForegroundNotifications = (onNotification) => {
  if (IS_EXPO_GO) return () => {};
  const N = getNotifications();
  if (!N) return () => {};
  const sub = N.addNotificationReceivedListener((notification) => {
    const { title, body, data } = notification.request.content;
    onNotification?.({ title, body, data });
  });
  return () => sub.remove();
};

export const subscribeToNotificationResponse = (onResponse) => {
  if (IS_EXPO_GO) return () => {};
  const N = getNotifications();
  if (!N) return () => {};
  const sub = N.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data ?? {};
    onResponse?.(data);
  });
  return () => sub.remove();
};
