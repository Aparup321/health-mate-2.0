import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { healthProfileApi } from "@/services/api";
import { useAuth } from "@/services/auth";
import Button from "@/components/Button";
import Card from "@/components/Card";

const goalOptions = [
  {
    id: "hydration",
    icon: "water-outline" as const,
    label: "Stay Hydrated",
    desc: "Track daily water intake",
    color: "#3B82F6",
  },
  {
    id: "exercise",
    icon: "barbell-outline" as const,
    label: "Exercise More",
    desc: "Build a workout routine",
    color: "#10B981",
  },
  {
    id: "breaks",
    icon: "cafe-outline" as const,
    label: "Take Breaks",
    desc: "Regular micro-breaks during work",
    color: "#F59E0B",
  },
  {
    id: "smoking",
    icon: "ban-outline" as const,
    label: "Quit Smoking",
    desc: "Track and reduce smoking habits",
    color: "#EF4444",
  },
  {
    id: "posture",
    icon: "body-outline" as const,
    label: "Better Posture",
    desc: "Stretch and posture reminders",
    color: "#A78BFA",
  },
  {
    id: "mindfulness",
    icon: "leaf-outline" as const,
    label: "Mindfulness",
    desc: "Breathing exercises & meditation",
    color: "#FB923C",
  },
];

export default function GoalsScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    age: string;
    gender: string;
    height: string;
    weight: string;
    isSmoker: string;
    exerciseFamiliarity: string;
  }>();

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  function toggleGoal(id: string) {
    setSelectedGoals((prev) =>
      prev.includes(id)
        ? prev.filter((g) => g !== id)
        : [...prev, id]
    );
  }

  async function handleFinish() {
    if (selectedGoals.length === 0) {
      Alert.alert("Select Goals", "Please select at least one wellness goal.");
      return;
    }

    setIsLoading(true);
    try {
      // Create health profile via API
      await healthProfileApi.create({
        userId: user?.id || "",
        age: parseInt(params.age!, 10),
        gender: params.gender as "male" | "female" | "other",
        height: parseFloat(params.height!),
        weight: parseFloat(params.weight!),
        isSmoker: params.isSmoker === "true",
        exerciseFamiliarity: params.exerciseFamiliarity as
          | "beginner"
          | "intermediate"
          | "advanced",
      });

      router.replace("/(tabs)" as Href);
    } catch (error: unknown) {
      // 409 = profile already exists — not an error, just navigate
      const status = (error as { status?: number })?.status;
      if (status === 409) {
        router.replace("/(tabs)" as Href);
        return;
      }
      const message =
        error instanceof Error ? error.message : "Failed to save profile";
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-slate-900"
      contentContainerClassName="px-6 pt-14 pb-12"
    >
      {/* Progress indicator */}
      <View className="flex-row gap-2 mb-8">
        <View className="flex-1 h-1 bg-emerald-500 rounded-full" />
        <View className="flex-1 h-1 bg-emerald-500 rounded-full" />
        <View className="flex-1 h-1 bg-emerald-500 rounded-full" />
      </View>

      <Text className="text-2xl font-bold text-white mb-2">
        Your Wellness Goals
      </Text>
      <Text className="text-slate-400 text-base mb-8">
        Select the areas you'd like to focus on
      </Text>

      {/* Goal grid */}
      <View className="flex-row flex-wrap gap-3 mb-8">
        {goalOptions.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id);
          return (
            <TouchableOpacity
              key={goal.id}
              className="w-[48%]"
              onPress={() => toggleGoal(goal.id)}
              activeOpacity={0.7}
            >
              <Card
                className={`items-center py-5 border ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-slate-700"
                }`}
              >
                <View
                  className="w-14 h-14 rounded-2xl items-center justify-center mb-3"
                  style={{ backgroundColor: `${goal.color}20` }}
                >
                  <Ionicons
                    name={goal.icon}
                    size={28}
                    color={isSelected ? goal.color : "#94A3B8"}
                  />
                </View>
                <Text
                  className={`text-sm font-semibold text-center ${
                    isSelected ? "text-white" : "text-slate-300"
                  }`}
                >
                  {goal.label}
                </Text>
                <Text className="text-slate-500 text-xs text-center mt-1">
                  {goal.desc}
                </Text>
                {isSelected && (
                  <View className="absolute top-2 right-2">
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#10B981"
                    />
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedGoals.length > 0 && (
        <Text className="text-slate-400 text-sm text-center mb-4">
          {selectedGoals.length} goal{selectedGoals.length > 1 ? "s" : ""}{" "}
          selected
        </Text>
      )}

      <View className="gap-3">
        <Button
          title="Start My Journey"
          onPress={handleFinish}
          isLoading={isLoading}
          icon={<Ionicons name="rocket-outline" size={20} color="#0F172A" />}
        />
        <Button
          title="Back"
          variant="ghost"
          onPress={() => router.back()}
        />
      </View>
    </ScrollView>
  );
}
