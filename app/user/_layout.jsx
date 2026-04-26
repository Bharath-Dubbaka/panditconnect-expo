// app/user/_layout.jsx
import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { COLORS, FONTS } from "../../constants/theme";
import { rf } from "../../constants/responsive";

function TabIcon({ emoji, focused }) {
  return <Text style={{ fontSize: focused ? 22 : 19, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>;
}

export default function UserTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.bgCard,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: COLORS.ochre,
        tabBarInactiveTintColor: COLORS.textDim,
        tabBarLabelStyle: { fontFamily: FONTS.body, fontSize: rf(10), letterSpacing: 0.5 },
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home", tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} /> }} />
      <Tabs.Screen name="browse" options={{ title: "Browse", tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" focused={focused} /> }} />
      <Tabs.Screen name="bookings" options={{ title: "Bookings", tabBarIcon: ({ focused }) => <TabIcon emoji="📅" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} /> }} />

      {/* Hidden screens */}
      <Tabs.Screen name="pandit/[id]" options={{ href: null }} />
      <Tabs.Screen name="book/[panditId]" options={{ href: null }} />
      <Tabs.Screen name="booking/[id]" options={{ href: null }} />
    </Tabs>
  );
}
