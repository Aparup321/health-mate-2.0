/**
 * Stats tab - Profile overview, BMI, achievements, streaks, exercise stats
 */
import { useState, useCallback } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/services/auth";
import { gamificationApi, healthProfileApi, activitiesApi } from "@/services/api";
import type {
  PointsResponse,
  StreakResponse,
  Achievement,
  BMIResponse,
  ExerciseLog,
} from "@/services/types";
import { Gamification } from "@/constants/theme";
import Card from "@/components/Card";
import StatCard from "@/components/StatCard";
import ProgressBar from "@/components/ProgressBar";

type TimeRange = "day" | "week" | "month";

/** Compute level info from total XP */
function getLevelInfo(totalXp: number) {
  const thresholds = Gamification.xpPerLevel;
  let level = 1;
  for (let i = 1; i < thresholds.length; i++) {
    if (totalXp >= (thresholds[i] ?? 0)) {
      level = i + 1;
    } else {
      break;
    }
  }
  const currentThreshold = thresholds[level - 1] ?? 0;
  const nextThreshold = thresholds[level] ?? currentThreshold + 1000;
  const currentLevelXp = totalXp - currentThreshold;
  const xpToNextLevel = nextThreshold - currentThreshold;
  return { level, currentLevelXp, xpToNextLevel };
}

/** Compute tier from total XP */
function getTier(totalXp: number) {
  const { tiers } = Gamification;
  if (totalXp >= tiers.gold.min) return { tier: "Gold", color: tiers.gold.color };
  if (totalXp >= tiers.silver.min) return { tier: "Silver", color: tiers.silver.color };
  return { tier: "Bronze", color: tiers.bronze.color };
}

/** Get next tier threshold */
function getNextTierThreshold(totalXp: number): number {
  const { tiers } = Gamification;
  if (totalXp < tiers.silver.min) return tiers.silver.min;
  if (totalXp < tiers.gold.min) return tiers.gold.min;
  return tiers.gold.min; // Already gold
}

export default function StatsScreen() {
  const { user } = useAuth();
  const [points, setPoints] = useState<PointsResponse | null>(null);
  const [streak, setStreak] = useState<StreakResponse | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [bmi, setBmi] = useState<BMIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [timeRange])
  );

  async function fetchAll() {
    setIsLoading(true);
    try {
      const [pRes, sRes, aRes, bRes, eRes] = await Promise.allSettled([
        gamificationApi.getPoints(),
        gamificationApi.getStreaks(),
        gamificationApi.getAchievements(),
        healthProfileApi.getBMI(),
        activitiesApi.getExercise({ limit: 100 }),
      ]);
      if (pRes.status === "fulfilled") setPoints(pRes.value.data);
      if (sRes.status === "fulfilled") setStreak(sRes.value.data);
      if (aRes.status === "fulfilled")
        setAchievements(aRes.value.data.achievements || []);
      if (bRes.status === "fulfilled") setBmi(bRes.value.data);
      if (eRes.status === "fulfilled") setExerciseLogs(eRes.value.data.logs || []);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }

  // Filter exercises based on time range
  const filteredExercises = exerciseLogs.filter((log) => {
    const logDate = new Date(log.date || log.createdAt);
    const now = new Date();
    if (timeRange === "day") {
      return logDate.toDateString() === now.toDateString();
    } else if (timeRange === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return logDate >= weekAgo;
    } else {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return logDate >= monthAgo;
    }
  });

  const totalExerciseMinutes = filteredExercises.reduce((sum, l) => sum + l.duration, 0);
  const totalCalories = filteredExercises.reduce((sum, l) => sum + (l.caloriesBurned ?? 0), 0);
  const exerciseCount = filteredExercises.length;
  const targetMinutes = timeRange === "day" ? 30 : timeRange === "week" ? 150 : 600;
  const progressPercent = Math.min((totalExerciseMinutes / targetMinutes) * 100, 100);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
      </SafeAreaView>
    );
  }

  // Derived values
  const totalXp = points?.totalPoints ?? 0;
  const levelInfo = getLevelInfo(totalXp);
  const tierInfo = getTier(totalXp);
  const nextTierThreshold = getNextTierThreshold(totalXp);

  // Best streak and current streak from streaks array
  const currentStreak =
    streak && streak.streaks.length > 0
      ? Math.max(...streak.streaks.map((s) => s.count))
      : 0;
  const longestStreak = currentStreak; // API only tracks active streaks

  function getBMIColor(bmiVal: number): string {
    if (bmiVal < 18.5) return "#3B82F6";
    if (bmiVal < 25) return "#22C55E";
    if (bmiVal < 30) return "#F59E0B";
    return "#EF4444";
  }

  function getBMICategory(bmiVal: number): string {
    if (bmiVal < 18.5) return "Underweight";
    if (bmiVal < 25) return "Normal";
    if (bmiVal < 30) return "Overweight";
    return "Obese";
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={["top"]}>
      <ScrollView contentContainerClassName="px-5 pb-8">
        {/* Header */}
        <View className="pt-4 pb-3">
          <Text className="text-white text-2xl font-bold">Your Stats</Text>
          <Text className="text-slate-400 text-sm mt-1">
            Track your wellness journey
          </Text>
        </View>

        {/* Profile card */}
        <Card variant="elevated" className="items-center py-6 mb-5">
          <View className="w-20 h-20 rounded-full bg-emerald-500/20 items-center justify-center mb-3">
            <Text className="text-emerald-400 text-3xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
          <Text className="text-white text-xl font-bold">
            {user?.name || "User"}
          </Text>
          <View
            className="flex-row items-center mt-2 px-4 py-1.5 rounded-full"
            style={{ backgroundColor: `${tierInfo.color}20` }}
          >
            <Ionicons name="shield" size={14} color={tierInfo.color} />
            <Text
              className="text-sm font-bold ml-1.5"
              style={{ color: tierInfo.color }}
            >
              {tierInfo.tier} Tier
            </Text>
          </View>
        </Card>

        {/* Stat cards grid */}
        <View className="flex-row gap-3 mb-3">
          <StatCard
            label="Total XP"
            value={totalXp.toLocaleString()}
            icon="star"
            iconColor="#A78BFA"
            className="flex-1"
          />
          <StatCard
            label="Level"
            value={levelInfo.level}
            icon="shield-checkmark"
            iconColor="#10B981"
            className="flex-1"
          />
        </View>
        <View className="flex-row gap-3 mb-5">
          <StatCard
            label="Current Streak"
            value={`${currentStreak} days`}
            icon="flame"
            iconColor="#FB923C"
            className="flex-1"
          />
          <StatCard
            label="Best Streak"
            value={`${longestStreak} days`}
            icon="ribbon"
            iconColor="#FBBF24"
            className="flex-1"
          />
        </View>

        {/* XP to next level */}
        {points && (
          <Card className="mb-5">
            <Text className="text-white text-base font-semibold mb-3">
              Level Progress
            </Text>
            <ProgressBar
              progress={levelInfo.currentLevelXp / (levelInfo.xpToNextLevel || 1)}
              color="#A78BFA"
              height={10}
              showPercentage
              sublabel={`${levelInfo.currentLevelXp} / ${levelInfo.xpToNextLevel} XP to Level ${levelInfo.level + 1}`}
            />
          </Card>
        )}

        {/* Tier progress */}
        <Card className="mb-5">
          <Text className="text-white text-base font-semibold mb-3">
            Tier Progress
          </Text>
          <ProgressBar
            progress={totalXp / (nextTierThreshold || 1)}
            color={tierInfo.color}
            height={10}
            showPercentage
            sublabel={`${totalXp} / ${nextTierThreshold} pts to next tier`}
          />
        </Card>

        {/* Exercise Stats Card */}
        <Card variant="elevated" className="mb-5">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-base font-semibold">Exercise Stats</Text>
            <View className="flex-row gap-2">
              {(["day", "week", "month"] as TimeRange[]).map((range) => (
                <TouchableOpacity
                  key={range}
                  className={`px-3 py-1 rounded-full ${
                    timeRange === range ? "bg-emerald-500" : "bg-slate-700"
                  }`}
                  onPress={() => setTimeRange(range)}
                >
                  <Text
                    className={`text-xs font-medium ${
                      timeRange === range ? "text-slate-900" : "text-slate-300"
                    }`}
                  >
                    {range === "day" ? "1D" : range === "week" ? "1W" : "1M"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Animated circular progress */}
          <View className="items-center mb-4">
            <View className="w-36 h-36 rounded-full items-center justify-center relative">
              <View className="absolute w-32 h-32 rounded-full bg-slate-800" />
              <View
                className="absolute w-32 h-32 rounded-full"
                style={{
                  borderWidth: 10,
                  borderColor: "#10B981",
                  borderTopColor: progressPercent > 25 ? "#10B981" : "transparent",
                  borderRightColor: progressPercent > 50 ? "#10B981" : "transparent",
                  borderBottomColor: progressPercent > 75 ? "#10B981" : "transparent",
                  borderLeftColor: progressPercent > 0 ? "#10B981" : "transparent",
                  transform: [{ rotate: "-90deg" }],
                }}
              />
              <View className="absolute items-center">
                <Text className="text-white text-3xl font-bold">{Math.round(progressPercent)}%</Text>
                <Text className="text-emerald-400 text-xs">Target</Text>
              </View>
            </View>
          </View>

          {/* Stats grid */}
          <View className="flex-row justify-around">
            <View className="items-center">
              <View className="w-12 h-12 rounded-full bg-emerald-500/20 items-center justify-center mb-2">
                <Ionicons name="time-outline" size={24} color="#10B981" />
              </View>
              <Text className="text-white text-xl font-bold">{totalExerciseMinutes}</Text>
              <Text className="text-slate-400 text-xs">minutes</Text>
            </View>
            <View className="items-center">
              <View className="w-12 h-12 rounded-full bg-orange-500/20 items-center justify-center mb-2">
                <Ionicons name="flame-outline" size={24} color="#F97316" />
              </View>
              <Text className="text-white text-xl font-bold">{totalCalories}</Text>
              <Text className="text-slate-400 text-xs">calories</Text>
            </View>
            <View className="items-center">
              <View className="w-12 h-12 rounded-full bg-purple-500/20 items-center justify-center mb-2">
                <Ionicons name="fitness-outline" size={24} color="#A855F7" />
              </View>
              <Text className="text-white text-xl font-bold">{exerciseCount}</Text>
              <Text className="text-slate-400 text-xs">sessions</Text>
            </View>
          </View>

          <View className="mt-4 bg-slate-800 rounded-lg p-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-slate-400 text-sm">Target Progress</Text>
              <Text className="text-emerald-400 text-sm font-semibold">{totalExerciseMinutes} / {targetMinutes} min</Text>
            </View>
            <ProgressBar
              progress={progressPercent / 100}
              color="#10B981"
              height={6}
              className="mt-2"
            />
          </View>
        </Card>

        {/* BMI card */}
        {bmi && (
          <Card className="mb-5">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white text-base font-semibold">BMI</Text>
              <Ionicons name="body-outline" size={20} color="#94A3B8" />
            </View>
            <View className="items-center py-3">
              <Text
                className="text-4xl font-extrabold"
                style={{ color: getBMIColor(bmi.bmi) }}
              >
                {bmi.bmi.toFixed(1)}
              </Text>
              <Text
                className="text-sm font-semibold mt-1"
                style={{ color: getBMIColor(bmi.bmi) }}
              >
                {bmi.category || getBMICategory(bmi.bmi)}
              </Text>
              <Text className="text-slate-500 text-xs mt-2">
                Height: {bmi.height}cm &middot; Weight: {bmi.weight}kg
              </Text>
            </View>
          </Card>
        )}

        {/* Achievements */}
        <Text className="text-white text-lg font-bold mb-3">Achievements</Text>
        {achievements.length === 0 ? (
          <Card className="items-center py-6">
            <Ionicons name="medal-outline" size={40} color="#334155" />
            <Text className="text-slate-500 text-sm mt-3 text-center">
              Complete activities to unlock achievements
            </Text>
          </Card>
        ) : (
          <View className="flex-row flex-wrap gap-3">
            {achievements.map((ach) => (
              <Card
                key={ach.id}
                className="w-[48%] items-center py-4"
              >
                <Text className="text-3xl mb-2">{ach.icon}</Text>
                <Text className="text-white text-sm font-semibold text-center">
                  {ach.name}
                </Text>
                <Text className="text-slate-500 text-xs text-center mt-1">
                  {ach.description}
                </Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
