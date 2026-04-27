// app/_layout.jsx - BARE MINIMUM - no native deps at all
import { useEffect } from "react";
import { View, Text } from "react-native";
import * as SplashScreen from "expo-splash-screen";

console.log("[PC] STEP 1 - bare imports ok");

SplashScreen.preventAutoHideAsync();

console.log("[PC] STEP 2 - splash prevented");

export default function RootLayout() {
  console.log("[PC] STEP 3 - RootLayout rendering");

  useEffect(() => {
    console.log("[PC] STEP 4 - useEffect fired, hiding splash");
    SplashScreen.hideAsync();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFBF5" }}>
      <Text style={{ fontSize: 24, color: "#C17F24" }}>🪔 PanditConnect</Text>
      <Text style={{ fontSize: 14, color: "#5C4A2A", marginTop: 8 }}>App is alive!</Text>
    </View>
  );
}