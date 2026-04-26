// app/_layout.jsx
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store } from "../store";
import {
  initAuth,
  selectToken,
  selectIsLoading,
  selectUserType,
  selectUser,
} from "../store/slices/authSlice";
import {
  useFonts,
  Cinzel_600SemiBold,
  Cinzel_700Bold,
} from "@expo-google-fonts/cinzel";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from "@expo-google-fonts/nunito";
import { connectSocket, disconnectSocket } from "../services/socket";
import { registerForPushNotifications } from "../services/notifications";

SplashScreen.preventAutoHideAsync();

// Routes user to the correct tab group based on auth + userType
function NavigationGuard() {
  const router = useRouter();
  const segments = useSegments();
  const token = useSelector(selectToken);
  const loading = useSelector(selectIsLoading);
  const userType = useSelector(selectUserType);
  const user = useSelector(selectUser);

  useEffect(() => {
    if (loading) return;

    const inAuth = segments[0] === "auth";
    const inOnboarding = segments[0] === "onboarding";
    const inUser = segments[0] === "user";
    const inPandit = segments[0] === "pandit";

    if (!token) {
      if (!inAuth) router.replace("/auth");
      return;
    }

    if (userType === "pandit") {
      // Pandit not yet through onboarding → send to onboarding
      if (!user?.onboardingComplete && !inOnboarding) {
        router.replace("/onboarding/credentials");
        return;
      }
      if (user?.onboardingComplete && !inPandit) {
        router.replace("/pandit/dashboard");
      }
      return;
    }

    // Regular user
    if (!inUser) router.replace("/user/home");
  }, [token, loading, userType, segments, user?.onboardingComplete]);

  return null;
}

function SocketManager() {
  const token = useSelector(selectToken);
  useEffect(() => {
    if (token) {
      connectSocket();
    } else {
      disconnectSocket();
    }
    return () => {};
  }, [token]);
  return null;
}

function InnerApp() {
  const dispatch = useDispatch();
  const loading = useSelector(selectIsLoading);
  const token = useSelector(selectToken);

  const [fontsLoaded] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  useEffect(() => {
    dispatch(initAuth());
  }, []);

  useEffect(() => {
    if (!loading && token) {
      registerForPushNotifications().then((token) => {
        if (token) {
          // Save to backend
          import("../services/api").then(({ authAPI }) =>
            authAPI.savePushToken(token).catch(() => {})
          );
        }
      });
    }
  }, [loading, token]);

  useEffect(() => {
    if (!loading && fontsLoaded) SplashScreen.hideAsync();
  }, [loading, fontsLoaded]);

  if (loading || !fontsLoaded) return null;

  return (
    <>
      <StatusBar style="dark" />
      <NavigationGuard />
      <SocketManager />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="user" />
        <Stack.Screen name="pandit" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <InnerApp />
    </Provider>
  );
}
