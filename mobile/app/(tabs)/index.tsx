/**
 * Dashboard / Timer Home - Main screen
 * Shows greeting, XP/streak stats, quick actions, and work session timer
 */
import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, router, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/services/auth";
import { gamificationApi, workSessionsApi } from "@/services/api";
import type { PointsResponse, StreakResponse } from "@/services/types";
import { Gamification } from "@/constants/theme";
import Card from "@/components/Card";
import StatCard from "@/components/StatCard";
import ProgressBar from "@/components/ProgressBar";
import Button from "@/components/Button";

type TimerState = "idle" | "running" | "paused" | "break";

/** Compute level info from total XP using Gamification.xpPerLevel thresholds */
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

export default function DashboardScreen() {
  const { user } = useAuth();
  const [points, setPoints] = useState<PointsResponse | null>(null);
  const [streak, setStreak] = useState<StreakResponse | null>(null);

  // Timer state
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [workMinutes, setWorkMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(workMinutes * 60);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Fetch gamification data on focus */
  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  async function fetchStats() {
    try {
      const [pointsRes, streakRes] = await Promise.allSettled([
        gamificationApi.getPoints(),
        gamificationApi.getStreaks(),
      ]);
      if (pointsRes.status === "fulfilled") setPoints(pointsRes.value.data);
      if (streakRes.status === "fulfilled") setStreak(streakRes.value.data);
    } catch {
      // Stats are non-critical, silently fail
    }
  }

  // Derived values from points
  const totalXp = points?.totalPoints ?? 0;
  const levelInfo = getLevelInfo(totalXp);
  const tierInfo = getTier(totalXp);

  // Best streak from streaks array
  const currentStreak =
    streak && streak.streaks.length > 0
      ? Math.max(...streak.streaks.map((s) => s.count))
      : 0;

  /** Timer controls */
  function startTimer() {
    setTimerState("running");
    setSecondsLeft(workMinutes * 60);

    // Create work session on backend
    if (user?.id) {
      workSessionsApi
        .create({
          userId: user.id,
          duration: workMinutes,
          workDuration: workMinutes,
          breaksScheduled: Math.floor(workMinutes / 25),
        })
        .then((res) => setSessionId(res.data.id))
        .catch(() => {});
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setTimerState("idle");
          handleSessionComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function pauseTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerState("paused");
  }

  function resumeTimer() {
    setTimerState("running");
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setTimerState("idle");
          handleSessionComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function stopTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerState("idle");
    setSecondsLeft(workMinutes * 60);
    if (sessionId) {
      workSessionsApi.delete(sessionId).catch(() => {});
      setSessionId(null);
    }
  }

  function handleSessionComplete() {
    Alert.alert(
      "Session Complete!",
      "Great job! Take a well-deserved break.",
      [{ text: "OK" }]
    );
    if (sessionId) {
      workSessionsApi.delete(sessionId).catch(() => {});
      setSessionId(null);
    }
    fetchStats();
  }

  /** Cleanup interval on unmount */
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timerDisplay = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
  const progress =
    timerState !== "idle"
      ? 1 - secondsLeft / (workMinutes * 60)
      : 0;

  const greeting = getGreeting();

  const durationOptions = [15, 25, 45, 60];

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={["top"]}>
      <ScrollView contentContainerClassName="px-5 pb-8">
        {/* Header */}
        <View className="flex-row items-center justify-between mt-4 mb-6">
          <View>
            <Text className="text-slate-400 text-sm">{greeting}</Text>
            <Text className="text-white text-2xl font-bold mt-1">
              {user?.name || "Wellness Warrior"}
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: `${tierInfo.color}20` }}
            >
              <Text
                className="text-xs font-bold"
                style={{ color: tierInfo.color }}
              >
                {tierInfo.tier.toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center"
              onPress={() => router.push("/(tabs)/settings" as Href)}
            >
              <Ionicons name="person-outline" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stat cards row */}
        <View className="flex-row gap-3 mb-6">
          <StatCard
            label="XP"
            value={totalXp}
            icon="star"
            iconColor="#A78BFA"
            className="flex-1"
          />
          <StatCard
            label="Streak"
            value={`${currentStreak}d`}
            icon="flame"
            iconColor="#FB923C"
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

        {/* XP Progress */}
        {points && (
          <ProgressBar
            progress={levelInfo.currentLevelXp / (levelInfo.xpToNextLevel || 1)}
            label={`Level ${levelInfo.level}`}
            sublabel={`${levelInfo.currentLevelXp} / ${levelInfo.xpToNextLevel} XP to next level`}
            color="#A78BFA"
            showPercentage
            className="mb-6"
          />
        )}

        {/* Timer */}
        <Card variant="elevated" className="items-center py-8 mb-6">
          <Text className="text-slate-400 text-sm mb-2 font-medium">
            {timerState === "idle"
              ? "WORK SESSION"
              : timerState === "paused"
              ? "PAUSED"
              : "FOCUS TIME"}
          </Text>
          <Text className="text-white text-6xl font-extrabold tracking-wider mb-4">
            {timerDisplay}
          </Text>

          {/* Duration selector (only when idle) */}
          {timerState === "idle" && (
            <View className="flex-row gap-2 mb-6">
              {durationOptions.map((dur) => (
                <TouchableOpacity
                  key={dur}
                  className={`px-4 py-2 rounded-lg ${
                    workMinutes === dur
                      ? "bg-emerald-500"
                      : "bg-slate-700"
                  }`}
                  onPress={() => {
                    setWorkMinutes(dur);
                    setSecondsLeft(dur * 60);
                  }}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      workMinutes === dur ? "text-slate-900" : "text-slate-300"
                    }`}
                  >
                    {dur}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Progress ring substitute: progress bar */}
          {timerState !== "idle" && (
            <ProgressBar
              progress={progress}
              color="#10B981"
              height={6}
              className="w-full px-4 mb-6"
            />
          )}

          {/* Timer controls */}
          <View className="flex-row gap-3">
            {timerState === "idle" && (
              <Button
                title="Start Focus"
                onPress={startTimer}
                icon={<Ionicons name="play" size={18} color="#0F172A" />}
              />
            )}
            {timerState === "running" && (
              <>
                <Button
                  title="Pause"
                  variant="secondary"
                  onPress={pauseTimer}
                  icon={
                    <Ionicons name="pause" size={18} color="#F8FAFC" />
                  }
                />
                <Button
                  title="Stop"
                  variant="danger"
                  onPress={stopTimer}
                  icon={
                    <Ionicons name="stop" size={18} color="#F8FAFC" />
                  }
                />
              </>
            )}
            {timerState === "paused" && (
              <>
                <Button
                  title="Resume"
                  onPress={resumeTimer}
                  icon={<Ionicons name="play" size={18} color="#0F172A" />}
                />
                <Button
                  title="Stop"
                  variant="danger"
                  onPress={stopTimer}
                  icon={
                    <Ionicons name="stop" size={18} color="#F8FAFC" />
                  }
                />
              </>
            )}
          </View>
        </Card>

        {/* Quick actions */}
        <Text className="text-white text-lg font-bold mb-3">
          Quick Actions
        </Text>
        <View className="flex-row gap-3 mb-4">
          <QuickAction
            icon="water-outline"
            label="Log Water"
            color="#3B82F6"
            onPress={() => router.push("/(tabs)/activities" as Href)}
          />
          <QuickAction
            icon="barbell-outline"
            label="Exercise"
            color="#10B981"
            onPress={() => router.push("/(tabs)/activities" as Href)}
          />
          <QuickAction
            icon="leaf-outline"
            label="Breathe"
            color="#A78BFA"
            onPress={() => router.push("/(tabs)/activities" as Href)}
          />
          <QuickAction
            icon="body-outline"
            label="Stretch"
            color="#FB923C"
            onPress={() => router.push("/(tabs)/activities" as Href)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({
  icon,
  label,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-1 items-center bg-slate-800 rounded-xl py-4"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mb-2"
        style={{ backgroundColor: `${color}20` }}
      >
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text className="text-slate-300 text-xs font-medium">{label}</Text>
    </TouchableOpacity>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}
