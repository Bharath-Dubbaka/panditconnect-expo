// app/pandit/_layout.jsx
import { Tabs } from "expo-router";
import { Text } from "react-native";
import { COLORS, FONTS } from "../../constants/theme";
import { rf } from "../../constants/responsive";

function TabIcon({ emoji, focused }) {
  return <Text style={{ fontSize: focused ? 22 : 19, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>;
}

export default function PanditTabLayout() {
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
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard", tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} /> }} />
      <Tabs.Screen name="requests" options={{ title: "Requests", tabBarIcon: ({ focused }) => <TabIcon emoji="🔔" focused={focused} /> }} />
      <Tabs.Screen name="bookings" options={{ title: "Bookings", tabBarIcon: ({ focused }) => <TabIcon emoji="📅" focused={focused} /> }} />
      <Tabs.Screen name="earnings" options={{ title: "Earnings", tabBarIcon: ({ focused }) => <TabIcon emoji="💰" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} /> }} />
    </Tabs>
  );
}
