// app/_layout.jsx
import { useEffect, useState } from "react";
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

SplashScreen.preventAutoHideAsync();

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
      if (!user?.onboardingComplete && !inOnboarding) {
        router.replace("/onboarding/credentials");
        return;
      }
      if (user?.onboardingComplete && !inPandit) {
        router.replace("/pandit/dashboard");
      }
      return;
    }

    if (!inUser) router.replace("/user/home");
  }, [token, loading, userType, segments, user?.onboardingComplete]);

  return null;
}

function SocketManager() {
  const token = useSelector(selectToken);
  useEffect(() => {
    if (token) connectSocket();
    else disconnectSocket();
    return () => {};
  }, [token]);
  return null;
}

function InnerApp() {
  const dispatch = useDispatch();
  const loading = useSelector(selectIsLoading);

  const [fontsLoaded, fontError] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  // fonts are ready when loaded OR if they errored (don't block on font error)
  const fontsReady = fontsLoaded || fontError != null;

  useEffect(() => {
    dispatch(initAuth());
  }, []);

  useEffect(() => {
    // Hide splash as soon as auth is resolved + fonts done (or failed)
    if (!loading && fontsReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loading, fontsReady]);

  // Don't render until both are ready
  if (loading || !fontsReady) return null;

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
