/**
 * Edit Profile Screen - Update user name, avatar, and health profile
 * Accessible as a modal from Settings
 */
import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { authApi, healthProfileApi } from "@/services/api";
import { ApiError } from "@/services/api";
import { useAuth } from "@/services/auth";
import type { HealthProfile } from "@/services/types";
import Card from "@/components/Card";
import Button from "@/components/Button";

export default function EditProfileScreen() {
  const { user, refreshUser } = useAuth();

  // Account info
  const [name, setName] = useState(user?.name || "");
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // Health profile
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [weight, setWeight] = useState("");
  const [targetCalories, setTargetCalories] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingHealth, setIsSavingHealth] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchHealthProfile();
    }, [])
  );

  async function fetchHealthProfile() {
    setIsLoadingProfile(true);
    try {
      const res = await healthProfileApi.get();
      const profile = res.data;
      setHealthProfile(profile);
      setWeight(profile.weight?.toString() || "");
      setTargetCalories(profile.targetCalories?.toString() || "");
    } catch {
      // No profile yet
    } finally {
      setIsLoadingProfile(false);
    }
  }

  async function handleSaveAccount() {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty.");
      return;
    }

    setIsSavingAccount(true);
    try {
      await authApi.updateMe({ name: name.trim() });
      await refreshUser();
      Alert.alert("Success", "Account updated successfully.");
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not update account.";
      Alert.alert("Error", msg);
    } finally {
      setIsSavingAccount(false);
    }
  }

  async function handleSaveHealth() {
    const w = parseFloat(weight);
    const cal = targetCalories ? parseInt(targetCalories, 10) : undefined;

    if (isNaN(w) || w <= 0) {
      Alert.alert("Error", "Please enter a valid weight.");
      return;
    }

    setIsSavingHealth(true);
    try {
      const updateData: { weight?: number; targetCalories?: number } = {
        weight: w,
      };
      if (cal && !isNaN(cal) && cal > 0) {
        updateData.targetCalories = cal;
      }

      await healthProfileApi.update(updateData);
      await fetchHealthProfile();
      Alert.alert("Success", "Health profile updated successfully.");
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not update health profile.";
      Alert.alert("Error", msg);
    } finally {
      setIsSavingHealth(false);
    }
  }

  function computeBMI(weightKg: number, heightCm: number): number {
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  }

  function getBMICategory(bmi: number): { label: string; color: string } {
    if (bmi < 18.5) return { label: "Underweight", color: "#3B82F6" };
    if (bmi < 25) return { label: "Normal", color: "#22C55E" };
    if (bmi < 30) return { label: "Overweight", color: "#F59E0B" };
    return { label: "Obese", color: "#EF4444" };
  }

  const currentWeight = parseFloat(weight) || healthProfile?.weight || 0;
  const bmi =
    healthProfile?.height && currentWeight > 0
      ? computeBMI(currentWeight, healthProfile.height)
      : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="px-5 pb-12"
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between pt-4 pb-1">
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold">
                Edit Profile
              </Text>
              <Text className="text-slate-400 text-sm mt-1">
                Update your personal information
              </Text>
            </View>
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center"
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Avatar & Name section */}
          <Card variant="elevated" className="mt-4 mb-6">
            <View className="items-center mb-4">
              <View className="w-20 h-20 rounded-full bg-emerald-500/20 items-center justify-center mb-3">
                <Text className="text-emerald-400 text-3xl font-bold">
                  {(name || user?.name || "?").charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text className="text-slate-400 text-sm">{user?.email}</Text>
            </View>

            <Text className="text-slate-300 text-sm font-medium mb-2">
              Display Name
            </Text>
            <TextInput
              className="bg-slate-900 text-white rounded-xl px-4 py-3.5 text-base mb-4 border border-slate-700"
              placeholder="Your name"
              placeholderTextColor="#64748B"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <Button
              title="Save Name"
              variant="primary"
              size="sm"
              isLoading={isSavingAccount}
              onPress={handleSaveAccount}
              disabled={name.trim() === (user?.name || "")}
            />
          </Card>

          {/* Health Profile section */}
          <Text className="text-white text-lg font-bold mb-3">
            Health Profile
          </Text>

          {isLoadingProfile ? (
            <Card className="mb-4">
              <View className="items-center py-6">
                <ActivityIndicator size="small" color="#10B981" />
                <Text className="text-slate-500 text-sm mt-2">
                  Loading health profile...
                </Text>
              </View>
            </Card>
          ) : !healthProfile ? (
            <Card className="mb-4" variant="outlined">
              <View className="items-center py-4">
                <Ionicons name="body-outline" size={32} color="#334155" />
                <Text className="text-slate-500 text-sm mt-2 text-center">
                  No health profile found.{"\n"}Complete onboarding to set up
                  your profile.
                </Text>
              </View>
            </Card>
          ) : (
            <>
              {/* Read-only info */}
              <Card className="mb-3">
                <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                  Profile Info
                </Text>
                <View className="flex-row flex-wrap gap-y-3">
                  <InfoItem
                    icon="person"
                    label="Gender"
                    value={
                      healthProfile.gender.charAt(0).toUpperCase() +
                      healthProfile.gender.slice(1)
                    }
                    color="#A78BFA"
                  />
                  <InfoItem
                    icon="calendar"
                    label="Age"
                    value={`${healthProfile.age} years`}
                    color="#3B82F6"
                  />
                  <InfoItem
                    icon="resize"
                    label="Height"
                    value={`${healthProfile.height} cm`}
                    color="#10B981"
                  />
                  <InfoItem
                    icon="barbell"
                    label="Experience"
                    value={
                      healthProfile.exerciseFamiliarity.charAt(0).toUpperCase() +
                      healthProfile.exerciseFamiliarity.slice(1)
                    }
                    color="#F59E0B"
                  />
                  <InfoItem
                    icon={healthProfile.isSmoker ? "ban" : "checkmark-circle"}
                    label="Smoker"
                    value={healthProfile.isSmoker ? "Yes" : "No"}
                    color={healthProfile.isSmoker ? "#EF4444" : "#22C55E"}
                  />
                </View>
              </Card>

              {/* Editable fields */}
              <Card className="mb-3">
                <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                  Update Metrics
                </Text>

                <Text className="text-slate-300 text-sm font-medium mb-1.5">
                  Weight (kg)
                </Text>
                <TextInput
                  className="bg-slate-900 text-white rounded-xl px-4 py-3 text-base mb-3 border border-slate-700"
                  placeholder="Enter weight in kg"
                  placeholderTextColor="#64748B"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                />

                <Text className="text-slate-300 text-sm font-medium mb-1.5">
                  Target Daily Calories
                </Text>
                <TextInput
                  className="bg-slate-900 text-white rounded-xl px-4 py-3 text-base mb-4 border border-slate-700"
                  placeholder="e.g., 2000"
                  placeholderTextColor="#64748B"
                  value={targetCalories}
                  onChangeText={setTargetCalories}
                  keyboardType="number-pad"
                />

                <Button
                  title="Update Health Profile"
                  variant="primary"
                  size="sm"
                  isLoading={isSavingHealth}
                  onPress={handleSaveHealth}
                />
              </Card>

              {/* BMI Preview */}
              {bmi && bmiCategory && (
                <Card className="mb-3" variant="elevated">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-slate-400 text-xs uppercase tracking-wider">
                        Current BMI
                      </Text>
                      <View className="flex-row items-baseline mt-1">
                        <Text className="text-white text-3xl font-extrabold">
                          {bmi.toFixed(1)}
                        </Text>
                        <Text
                          className="text-sm font-semibold ml-2"
                          style={{ color: bmiCategory.color }}
                        >
                          {bmiCategory.label}
                        </Text>
                      </View>
                    </View>
                    <View
                      className="w-14 h-14 rounded-full items-center justify-center"
                      style={{ backgroundColor: `${bmiCategory.color}20` }}
                    >
                      <Ionicons
                        name="body"
                        size={28}
                        color={bmiCategory.color}
                      />
                    </View>
                  </View>

                  {/* BMI scale */}
                  <View className="flex-row mt-4 h-2 rounded-full overflow-hidden">
                    <View className="flex-1 bg-blue-500" />
                    <View className="flex-1 bg-green-500" />
                    <View className="flex-1 bg-amber-500" />
                    <View className="flex-1 bg-red-500" />
                  </View>
                  <View className="flex-row justify-between mt-1">
                    <Text className="text-slate-500 text-[10px]">
                      {"<18.5"}
                    </Text>
                    <Text className="text-slate-500 text-[10px]">18.5</Text>
                    <Text className="text-slate-500 text-[10px]">25</Text>
                    <Text className="text-slate-500 text-[10px]">30</Text>
                    <Text className="text-slate-500 text-[10px]">{"40+"}</Text>
                  </View>
                </Card>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InfoItem({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View className="w-1/2 flex-row items-center">
      <View
        className="w-8 h-8 rounded-lg items-center justify-center mr-2"
        style={{ backgroundColor: `${color}20` }}
      >
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <View>
        <Text className="text-slate-500 text-[10px] uppercase">{label}</Text>
        <Text className="text-white text-sm font-medium">{value}</Text>
      </View>
    </View>
  );
}
