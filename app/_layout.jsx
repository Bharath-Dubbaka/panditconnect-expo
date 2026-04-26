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

// ── NO socket import — socket.io-client crashes APK on Expo standalone
// ── NO google-signin import — not used in PanditConnect
// ── NO notifications import at module level — lazy loaded after auth

const LOG = (tag, msg, data) => {
  const line = `[PC][${tag}] ${msg}${
    data !== undefined ? " → " + JSON.stringify(data) : ""
  }`;
  console.log(line);
};

SplashScreen.preventAutoHideAsync();
LOG("BOOT", "preventAutoHideAsync called");

function NavigationGuard() {
  const router = useRouter();
  const segments = useSegments();
  const token = useSelector(selectToken);
  const loading = useSelector(selectIsLoading);
  const userType = useSelector(selectUserType);
  const user = useSelector(selectUser);

  useEffect(() => {
    LOG("NAV", "effect", {
      loading,
      hasToken: !!token,
      userType,
      seg: segments[0],
    });
    if (loading) return;

    const inAuth = segments[0] === "auth";
    const inOnboarding = segments[0] === "onboarding";
    const inUser = segments[0] === "user";
    const inPandit = segments[0] === "pandit";

    if (!token) {
      LOG("NAV", "no token → /auth");
      if (!inAuth) router.replace("/auth");
      return;
    }

    if (userType === "pandit") {
      if (!user?.onboardingComplete && !inOnboarding) {
        LOG("NAV", "pandit onboarding → /onboarding/credentials");
        router.replace("/onboarding/credentials");
        return;
      }
      if (user?.onboardingComplete && !inPandit) {
        LOG("NAV", "pandit ready → /pandit/dashboard");
        router.replace("/pandit/dashboard");
      }
      return;
    }

    LOG("NAV", "user → /user/home");
    if (!inUser) router.replace("/user/home");
  }, [token, loading, userType, segments, user?.onboardingComplete]);

  return null;
}

function InnerApp() {
  const dispatch = useDispatch();
  const loading = useSelector(selectIsLoading);
  const token = useSelector(selectToken);

  LOG("INNER", "render", { loading });

  const [fontsLoaded, fontError] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  const fontsReady = fontsLoaded || fontError != null;

  useEffect(() => {
    LOG("FONTS", "state", {
      fontsLoaded,
      fontError: fontError?.message,
      fontsReady,
    });
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    LOG("AUTH", "dispatching initAuth");
    dispatch(initAuth())
      .then((r) =>
        LOG("AUTH", "initAuth done", {
          type: r?.type,
          hasToken: !!r?.payload?.token,
        })
      )
      .catch((e) => LOG("AUTH", "initAuth error", { msg: e?.message }));
  }, []);

  // Push notifications — lazy loaded AFTER auth resolves, never at module level
  useEffect(() => {
    if (!loading && token) {
      LOG("PUSH", "registering push notifications");
      import("../services/notifications")
        .then(({ registerForPushNotifications }) =>
          registerForPushNotifications()
        )
        .then((pushToken) => {
          if (pushToken) {
            LOG("PUSH", "got push token, saving");
            import("../services/api").then(({ authAPI }) =>
              authAPI.savePushToken(pushToken).catch(() => {})
            );
          }
        })
        .catch((e) =>
          LOG("PUSH", "push registration error", { msg: e?.message })
        );
    }
  }, [loading, token]);

  useEffect(() => {
    LOG("SPLASH", "hide check", { loading, fontsReady });
    if (!loading && fontsReady) {
      LOG("SPLASH", "calling hideAsync");
      SplashScreen.hideAsync()
        .then(() => LOG("SPLASH", "hidden ✅"))
        .catch((e) => LOG("SPLASH", "hide error", { msg: e?.message }));
    }
  }, [loading, fontsReady]);

  if (loading || !fontsReady) {
    LOG("RENDER", "blocked", { loading, fontsReady });
    return null;
  }

  LOG("RENDER", "rendering Stack ✅");

  return (
    <>
      <StatusBar style="dark" />
      <NavigationGuard />
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
  LOG("ROOT", "mounting");
  return (
    <Provider store={store}>
      <InnerApp />
    </Provider>
  );
}
