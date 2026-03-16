import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type TabIcon = keyof typeof Ionicons.glyphMap;

const tabs: {
  name: string;
  title: string;
  icon: TabIcon;
  iconFocused: TabIcon;
}[] = [
  {
    name: "index",
    title: "Timer",
    icon: "timer-outline",
    iconFocused: "timer",
  },
  {
    name: "activities",
    title: "Activities",
    icon: "fitness-outline",
    iconFocused: "fitness",
  },
  {
    name: "leaderboard",
    title: "Ranks",
    icon: "trophy-outline",
    iconFocused: "trophy",
  },
  {
    name: "stats",
    title: "Stats",
    icon: "stats-chart-outline",
    iconFocused: "stats-chart",
  },
  {
    name: "settings",
    title: "Settings",
    icon: "settings-outline",
    iconFocused: "settings",
  },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1E293B",
          borderTopColor: "#334155",
          borderTopWidth: 1,
          height: 88,
          paddingBottom: 28,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#10B981",
        tabBarInactiveTintColor: "#64748B",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tab.iconFocused : tab.icon}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
