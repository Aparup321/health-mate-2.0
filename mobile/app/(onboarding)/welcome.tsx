import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import Button from "@/components/Button";

const features = [
  {
    icon: "timer-outline" as const,
    title: "Smart Work Timer",
    desc: "Stay productive with timed sessions & break reminders",
  },
  {
    icon: "water-outline" as const,
    title: "Hydration Tracking",
    desc: "Never forget to drink water throughout the day",
  },
  {
    icon: "trophy-outline" as const,
    title: "Gamified Wellness",
    desc: "Earn XP, coins & climb the leaderboard",
  },
  {
    icon: "people-outline" as const,
    title: "Peer Challenges",
    desc: "Compete with friends for healthy habits",
  },
];

export default function WelcomeScreen() {
  return (
    <View className="flex-1 bg-slate-900 px-6 pt-16 pb-12 justify-between">
      {/* Header */}
      <View className="items-center mt-8">
        <View className="w-24 h-24 rounded-3xl bg-emerald-500 items-center justify-center mb-6">
          <Ionicons name="heart-half" size={48} color="#0F172A" />
        </View>
        <Text className="text-3xl font-bold text-white text-center">
          Welcome to HealthMate
        </Text>
        <Text className="text-slate-400 text-base mt-3 text-center">
          Let's set up your wellness profile
        </Text>
      </View>

      {/* Features */}
      <View className="gap-4 my-8">
        {features.map((feature) => (
          <View
            key={feature.title}
            className="flex-row items-center bg-slate-800 rounded-xl p-4"
          >
            <View className="w-12 h-12 rounded-xl bg-emerald-500/15 items-center justify-center mr-4">
              <Ionicons name={feature.icon} size={24} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-semibold">
                {feature.title}
              </Text>
              <Text className="text-slate-400 text-sm mt-0.5">
                {feature.desc}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* CTA */}
      <View className="gap-3">
        <Button
          title="Get Started"
          onPress={() =>
            router.push("/(onboarding)/body-metrics" as Href)
          }
        />
        <Button
          title="Skip for now"
          variant="ghost"
          onPress={() => router.replace("/(tabs)" as Href)}
        />
      </View>
    </View>
  );
}
