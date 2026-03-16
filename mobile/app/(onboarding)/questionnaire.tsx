import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, type Href } from "expo-router";
import Button from "@/components/Button";

type ExerciseLevel = "beginner" | "intermediate" | "advanced";

export default function QuestionnaireScreen() {
  const params = useLocalSearchParams<{
    age: string;
    gender: string;
    height: string;
    weight: string;
  }>();

  const [isSmoker, setIsSmoker] = useState<boolean | null>(null);
  const [exerciseLevel, setExerciseLevel] = useState<ExerciseLevel | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (isSmoker === null) newErrors.smoker = "Please select an option";
    if (!exerciseLevel) newErrors.exercise = "Please select your experience level";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (!validate()) return;
    router.push({
      pathname: "/(onboarding)/goals" as Href,
      params: {
        ...params,
        isSmoker: String(isSmoker),
        exerciseFamiliarity: exerciseLevel!,
      },
    } as never);
  }

  const exerciseLevels: {
    value: ExerciseLevel;
    label: string;
    desc: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    {
      value: "beginner",
      label: "Beginner",
      desc: "New to exercise or returning after a long break",
      icon: "leaf-outline",
    },
    {
      value: "intermediate",
      label: "Intermediate",
      desc: "Exercise 2-4 times a week regularly",
      icon: "fitness-outline",
    },
    {
      value: "advanced",
      label: "Advanced",
      desc: "Exercise 5+ times a week, experienced athlete",
      icon: "flash-outline",
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-slate-900"
      contentContainerClassName="px-6 pt-14 pb-12"
    >
      {/* Progress indicator */}
      <View className="flex-row gap-2 mb-8">
        <View className="flex-1 h-1 bg-emerald-500 rounded-full" />
        <View className="flex-1 h-1 bg-emerald-500 rounded-full" />
        <View className="flex-1 h-1 bg-slate-700 rounded-full" />
      </View>

      <Text className="text-2xl font-bold text-white mb-2">
        Lifestyle Info
      </Text>
      <Text className="text-slate-400 text-base mb-8">
        Help us tailor reminders and challenges for you
      </Text>

      {/* Smoking question */}
      <View className="mb-8">
        <Text className="text-white text-base font-semibold mb-4">
          Do you smoke?
        </Text>
        <View className="flex-row gap-3">
          {[
            { value: false, label: "No", icon: "checkmark-circle-outline" as const },
            { value: true, label: "Yes", icon: "close-circle-outline" as const },
          ].map((option) => (
            <TouchableOpacity
              key={option.label}
              className={`flex-1 flex-row items-center justify-center py-4 rounded-xl border ${
                isSmoker === option.value
                  ? "bg-emerald-500/15 border-emerald-500"
                  : "bg-slate-800 border-slate-700"
              }`}
              onPress={() => {
                setIsSmoker(option.value);
                setErrors((prev) => ({ ...prev, smoker: "" }));
              }}
            >
              <Ionicons
                name={option.icon}
                size={22}
                color={isSmoker === option.value ? "#10B981" : "#94A3B8"}
              />
              <Text
                className={`ml-2 text-base font-medium ${
                  isSmoker === option.value
                    ? "text-emerald-400"
                    : "text-slate-400"
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.smoker ? (
          <Text className="text-red-400 text-xs mt-1 ml-1">
            {errors.smoker}
          </Text>
        ) : null}
      </View>

      {/* Exercise familiarity */}
      <View className="mb-8">
        <Text className="text-white text-base font-semibold mb-4">
          How familiar are you with exercise?
        </Text>
        <View className="gap-3">
          {exerciseLevels.map((level) => (
            <TouchableOpacity
              key={level.value}
              className={`flex-row items-center p-4 rounded-xl border ${
                exerciseLevel === level.value
                  ? "bg-emerald-500/15 border-emerald-500"
                  : "bg-slate-800 border-slate-700"
              }`}
              onPress={() => {
                setExerciseLevel(level.value);
                setErrors((prev) => ({ ...prev, exercise: "" }));
              }}
            >
              <View
                className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${
                  exerciseLevel === level.value
                    ? "bg-emerald-500/20"
                    : "bg-slate-700"
                }`}
              >
                <Ionicons
                  name={level.icon}
                  size={24}
                  color={
                    exerciseLevel === level.value ? "#10B981" : "#94A3B8"
                  }
                />
              </View>
              <View className="flex-1">
                <Text
                  className={`text-base font-semibold ${
                    exerciseLevel === level.value
                      ? "text-emerald-400"
                      : "text-white"
                  }`}
                >
                  {level.label}
                </Text>
                <Text className="text-slate-400 text-sm mt-0.5">
                  {level.desc}
                </Text>
              </View>
              {exerciseLevel === level.value && (
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              )}
            </TouchableOpacity>
          ))}
        </View>
        {errors.exercise ? (
          <Text className="text-red-400 text-xs mt-1 ml-1">
            {errors.exercise}
          </Text>
        ) : null}
      </View>

      <View className="gap-3">
        <Button title="Continue" onPress={handleNext} />
        <Button title="Back" variant="ghost" onPress={() => router.back()} />
      </View>
    </ScrollView>
  );
}
