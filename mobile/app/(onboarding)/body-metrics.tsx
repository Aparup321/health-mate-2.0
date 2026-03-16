import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Card from "@/components/Card";

type Gender = "male" | "female" | "other";

export default function BodyMetricsScreen() {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      newErrors.age = "Enter a valid age (13-120)";
    }
    if (!gender) {
      newErrors.gender = "Select your gender";
    }
    const heightNum = parseFloat(height);
    if (!height || isNaN(heightNum) || heightNum < 50 || heightNum > 300) {
      newErrors.height = "Enter valid height in cm (50-300)";
    }
    const weightNum = parseFloat(weight);
    if (!weight || isNaN(weightNum) || weightNum < 20 || weightNum > 500) {
      newErrors.weight = "Enter valid weight in kg (20-500)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /** Calculate BMI preview */
  function getBMI(): { value: string; category: string; color: string } | null {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h < 50 || w < 20) return null;

    const bmi = w / ((h / 100) * (h / 100));
    let category: string;
    let color: string;

    if (bmi < 18.5) {
      category = "Underweight";
      color = "#3B82F6";
    } else if (bmi < 25) {
      category = "Normal";
      color = "#22C55E";
    } else if (bmi < 30) {
      category = "Overweight";
      color = "#F59E0B";
    } else {
      category = "Obese";
      color = "#EF4444";
    }

    return { value: bmi.toFixed(1), category, color };
  }

  function handleNext() {
    if (!validate()) return;
    // Pass data via query params to next screen
    router.push({
      pathname: "/(onboarding)/questionnaire" as Href,
      params: {
        age,
        gender: gender!,
        height,
        weight,
      },
    } as never);
  }

  const bmi = getBMI();
  const genders: { value: Gender; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: "male", label: "Male", icon: "male" },
    { value: "female", label: "Female", icon: "female" },
    { value: "other", label: "Other", icon: "person" },
  ];

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-900"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerClassName="px-6 pt-14 pb-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress indicator */}
        <View className="flex-row gap-2 mb-8">
          <View className="flex-1 h-1 bg-emerald-500 rounded-full" />
          <View className="flex-1 h-1 bg-slate-700 rounded-full" />
          <View className="flex-1 h-1 bg-slate-700 rounded-full" />
        </View>

        <Text className="text-2xl font-bold text-white mb-2">
          Body Metrics
        </Text>
        <Text className="text-slate-400 text-base mb-8">
          Help us calculate your BMI and personalize your experience
        </Text>

        <View className="gap-5">
          <Input
            label="Age"
            icon="calendar-outline"
            placeholder="e.g. 25"
            value={age}
            onChangeText={(text) => {
              setAge(text.replace(/[^0-9]/g, ""));
              setErrors((prev) => ({ ...prev, age: "" }));
            }}
            keyboardType="number-pad"
            error={errors.age}
          />

          {/* Gender selector */}
          <View>
            <Text className="text-slate-300 text-sm font-medium mb-2 ml-1">
              Gender
            </Text>
            <View className="flex-row gap-3">
              {genders.map((g) => (
                <TouchableOpacity
                  key={g.value}
                  className={`flex-1 items-center py-3 rounded-xl border ${
                    gender === g.value
                      ? "bg-emerald-500/15 border-emerald-500"
                      : "bg-slate-800 border-slate-700"
                  }`}
                  onPress={() => {
                    setGender(g.value);
                    setErrors((prev) => ({ ...prev, gender: "" }));
                  }}
                >
                  <Ionicons
                    name={g.icon}
                    size={22}
                    color={gender === g.value ? "#10B981" : "#94A3B8"}
                  />
                  <Text
                    className={`text-sm mt-1 ${
                      gender === g.value
                        ? "text-emerald-400 font-semibold"
                        : "text-slate-400"
                    }`}
                  >
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.gender ? (
              <Text className="text-red-400 text-xs mt-1 ml-1">
                {errors.gender}
              </Text>
            ) : null}
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1">
              <Input
                label="Height (cm)"
                icon="resize-outline"
                placeholder="170"
                value={height}
                onChangeText={(text) => {
                  setHeight(text.replace(/[^0-9.]/g, ""));
                  setErrors((prev) => ({ ...prev, height: "" }));
                }}
                keyboardType="decimal-pad"
                error={errors.height}
              />
            </View>
            <View className="flex-1">
              <Input
                label="Weight (kg)"
                icon="barbell-outline"
                placeholder="70"
                value={weight}
                onChangeText={(text) => {
                  setWeight(text.replace(/[^0-9.]/g, ""));
                  setErrors((prev) => ({ ...prev, weight: "" }));
                }}
                keyboardType="decimal-pad"
                error={errors.weight}
              />
            </View>
          </View>

          {/* BMI Preview */}
          {bmi && (
            <Card variant="outlined" className="items-center py-5">
              <Text className="text-slate-400 text-sm mb-1">
                Your BMI
              </Text>
              <Text
                className="text-4xl font-extrabold"
                style={{ color: bmi.color }}
              >
                {bmi.value}
              </Text>
              <Text
                className="text-sm font-semibold mt-1"
                style={{ color: bmi.color }}
              >
                {bmi.category}
              </Text>
            </Card>
          )}
        </View>

        <View className="mt-8 gap-3">
          <Button title="Continue" onPress={handleNext} />
          <Button
            title="Back"
            variant="ghost"
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
