/**
 * Activities tab - Hydration, Exercise, Breaks, Breathing
 * All tabs are fully wired to the backend API.
 */
import { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/services/auth";
import { activitiesApi } from "@/services/api";
import type {
  HydrationLog,
  ExerciseLog,
  ExerciseType,
  BreakLog,
  BreakType,
} from "@/services/types";
import Card from "@/components/Card";
import Button from "@/components/Button";
import ProgressBar from "@/components/ProgressBar";

type ActivityTab = "hydration" | "exercise" | "breathing" | "breaks";

const DAILY_WATER_GOAL = 2000; // ml (matches backend HEALTH_GOALS.DAILY_WATER_INTAKE_ML)

export default function ActivitiesScreen() {
  const [activeTab, setActiveTab] = useState<ActivityTab>("hydration");

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={["top"]}>
      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <Text className="text-white text-2xl font-bold">Activities</Text>
        <Text className="text-slate-400 text-sm mt-1">
          Track your daily wellness activities
        </Text>
      </View>

      {/* Tab selector */}
      <View className="flex-row mx-5 mb-4 bg-slate-800 rounded-xl p-1">
        {(
          [
            { id: "hydration", label: "Water", icon: "water-outline" },
            { id: "exercise", label: "Exercise", icon: "barbell-outline" },
            { id: "breathing", label: "Breathe", icon: "leaf-outline" },
            { id: "breaks", label: "Breaks", icon: "cafe-outline" },
          ] as const
        ).map((tab) => (
          <TouchableOpacity
            key={tab.id}
            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg ${
              activeTab === tab.id ? "bg-emerald-500" : ""
            }`}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon}
              size={16}
              color={activeTab === tab.id ? "#0F172A" : "#94A3B8"}
            />
            <Text
              className={`text-xs font-semibold ml-1 ${
                activeTab === tab.id ? "text-slate-900" : "text-slate-400"
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "hydration" && <HydrationTab />}
      {activeTab === "exercise" && <ExerciseTab />}
      {activeTab === "breathing" && <BreathingTab />}
      {activeTab === "breaks" && <BreaksTab />}
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────
// HYDRATION TAB
// ─────────────────────────────────────────────────────────
function HydrationTab() {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const [logs, setLogs] = useState<HydrationLog[]>([]);
  const [totalToday, setTotalToday] = useState(0);

  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [])
  );

  async function fetchLogs() {
    try {
      const res = await activitiesApi.getHydration({ limit: 50 });
      const allLogs = res.data.logs || [];
      setLogs(allLogs);
      // Sum today's intake
      const today = new Date().toDateString();
      const todayTotal = allLogs
        .filter((l) => new Date(l.date).toDateString() === today)
        .reduce((sum, l) => sum + l.amount, 0);
      setTotalToday(todayTotal);
    } catch {
      // silently fail
    }
  }

  async function logWater(ml: number) {
    if (!user?.id) return;
    setIsLogging(true);
    try {
      await activitiesApi.logHydration({
        userId: user.id,
        amount: ml,
        date: new Date().toISOString(),
      });
      setTotalToday((prev) => prev + ml);
      setAmount("");
      fetchLogs();
    } catch {
      Alert.alert("Error", "Failed to log water intake");
    } finally {
      setIsLogging(false);
    }
  }

  const quickAmounts = [150, 250, 500, 750];
  const goalReached = totalToday >= DAILY_WATER_GOAL;

  return (
    <ScrollView contentContainerClassName="px-5 pb-8">
      {/* Daily progress */}
      <Card variant="elevated" className="mb-5">
        <View className="items-center mb-3">
          <Ionicons
            name="water"
            size={32}
            color={goalReached ? "#22C55E" : "#3B82F6"}
          />
          <Text className="text-3xl font-extrabold text-white mt-2">
            {totalToday} ml
          </Text>
          <Text className="text-slate-400 text-sm">
            of {DAILY_WATER_GOAL} ml daily goal
          </Text>
          {goalReached && (
            <Text className="text-emerald-400 text-xs font-semibold mt-1">
              Daily goal reached! +20 bonus XP
            </Text>
          )}
        </View>
        <ProgressBar
          progress={Math.min(totalToday / DAILY_WATER_GOAL, 1)}
          color={goalReached ? "#22C55E" : "#3B82F6"}
          height={10}
          showPercentage
        />
      </Card>

      {/* Quick add buttons */}
      <Text className="text-white text-base font-semibold mb-3">
        Quick Add
      </Text>
      <View className="flex-row gap-3 mb-5">
        {quickAmounts.map((ml) => (
          <TouchableOpacity
            key={ml}
            className="flex-1 items-center bg-slate-800 rounded-xl py-3 border border-slate-700"
            onPress={() => logWater(ml)}
            disabled={isLogging}
          >
            <Ionicons name="water-outline" size={20} color="#3B82F6" />
            <Text className="text-white text-sm font-semibold mt-1">
              {ml}ml
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom amount */}
      <View className="flex-row gap-3 mb-6">
        <View className="flex-1 flex-row items-center bg-slate-800 rounded-xl px-4 border border-slate-700">
          <TextInput
            className="flex-1 text-white text-base py-3"
            placeholder="Custom amount (ml)"
            placeholderTextColor="#64748B"
            value={amount}
            onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ""))}
            keyboardType="number-pad"
          />
        </View>
        <Button
          title="Add"
          size="sm"
          onPress={() => {
            const ml = parseInt(amount, 10);
            if (ml > 0) logWater(ml);
          }}
          isLoading={isLogging}
          disabled={!amount}
        />
      </View>

      {/* Recent logs */}
      <Text className="text-white text-base font-semibold mb-3">
        Recent Logs
      </Text>
      {logs.length === 0 ? (
        <Text className="text-slate-500 text-sm text-center py-4">
          No water logged yet today
        </Text>
      ) : (
        logs.slice(0, 10).map((log) => (
          <View
            key={log._id}
            className="flex-row items-center justify-between bg-slate-800 rounded-xl px-4 py-3 mb-2"
          >
            <View className="flex-row items-center">
              <Ionicons name="water" size={18} color="#3B82F6" />
              <Text className="text-white text-base ml-3 font-medium">
                {log.amount} ml
              </Text>
            </View>
            <Text className="text-slate-500 text-xs">
              {new Date(log.time || log.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────
// EXERCISE TAB
// ─────────────────────────────────────────────────────────
const EXERCISES: {
  type: ExerciseType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  defaultDuration: number;
  defaultCalories: number;
  intensity: "low" | "medium" | "high";
  color: string;
}[] = [
  { type: "walking", label: "Walking", icon: "walk-outline", defaultDuration: 15, defaultCalories: 60, intensity: "low", color: "#22C55E" },
  { type: "running", label: "Running", icon: "speedometer-outline", defaultDuration: 20, defaultCalories: 200, intensity: "high", color: "#EF4444" },
  { type: "yoga", label: "Yoga", icon: "leaf-outline", defaultDuration: 20, defaultCalories: 80, intensity: "medium", color: "#A78BFA" },
  { type: "cycling", label: "Cycling", icon: "bicycle-outline", defaultDuration: 20, defaultCalories: 150, intensity: "medium", color: "#F59E0B" },
  { type: "swimming", label: "Swimming", icon: "water-outline", defaultDuration: 30, defaultCalories: 250, intensity: "high", color: "#3B82F6" },
  { type: "gym", label: "Gym", icon: "barbell-outline", defaultDuration: 30, defaultCalories: 200, intensity: "high", color: "#FB923C" },
  { type: "sports", label: "Sports", icon: "football-outline", defaultDuration: 30, defaultCalories: 200, intensity: "high", color: "#10B981" },
  { type: "other", label: "Other", icon: "fitness-outline", defaultDuration: 15, defaultCalories: 80, intensity: "medium", color: "#94A3B8" },
];

function ExerciseTab() {
  const { user } = useAuth();
  const [isLogging, setIsLogging] = useState(false);
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [customDuration, setCustomDuration] = useState<Record<string, string>>({});

  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [])
  );

  async function fetchLogs() {
    try {
      const res = await activitiesApi.getExercise({ limit: 20 });
      setLogs(res.data.logs || []);
    } catch {
      // silently fail
    }
  }

  async function logExercise(exercise: (typeof EXERCISES)[0]) {
    if (!user?.id) return;
    setIsLogging(true);
    const duration = parseInt(customDuration[exercise.type] || "", 10) || exercise.defaultDuration;
    // Scale calories linearly with custom duration
    const calories = Math.round(
      (duration / exercise.defaultDuration) * exercise.defaultCalories
    );
    try {
      await activitiesApi.logExercise({
        userId: user.id,
        exerciseType: exercise.type,
        duration,
        intensity: exercise.intensity,
        caloriesBurned: calories,
      });
      Alert.alert(
        "Logged!",
        `${exercise.label} — ${duration} min, ~${calories} cal burned\n+${
          exercise.intensity === "high" ? 75 : exercise.intensity === "medium" ? 50 : 30
        } XP`
      );
      setCustomDuration((prev) => ({ ...prev, [exercise.type]: "" }));
      fetchLogs();
    } catch {
      Alert.alert("Error", "Failed to log exercise");
    } finally {
      setIsLogging(false);
    }
  }

  // Today's summary
  const today = new Date().toDateString();
  const todayLogs = logs.filter(
    (l) => new Date(l.date || l.createdAt).toDateString() === today
  );
  const todayDuration = todayLogs.reduce((sum, l) => sum + l.duration, 0);
  const todayCalories = todayLogs.reduce(
    (sum, l) => sum + (l.caloriesBurned ?? 0),
    0
  );

  return (
    <ScrollView contentContainerClassName="px-5 pb-8">
      {/* Today's stats */}
      <View className="flex-row gap-3 mb-5">
        <Card variant="elevated" className="flex-1 items-center py-4">
          <Ionicons name="time-outline" size={22} color="#A78BFA" />
          <Text className="text-white text-xl font-bold mt-1">
            {todayDuration}
          </Text>
          <Text className="text-slate-400 text-xs">min today</Text>
        </Card>
        <Card variant="elevated" className="flex-1 items-center py-4">
          <Ionicons name="flame-outline" size={22} color="#FB923C" />
          <Text className="text-white text-xl font-bold mt-1">
            {todayCalories}
          </Text>
          <Text className="text-slate-400 text-xs">cal burned</Text>
        </Card>
        <Card variant="elevated" className="flex-1 items-center py-4">
          <Ionicons name="checkmark-circle-outline" size={22} color="#22C55E" />
          <Text className="text-white text-xl font-bold mt-1">
            {todayLogs.length}
          </Text>
          <Text className="text-slate-400 text-xs">sessions</Text>
        </Card>
      </View>

      {/* Exercise cards */}
      <Text className="text-white text-base font-semibold mb-3">
        Log Exercise
      </Text>
      <View className="gap-3 mb-6">
        {EXERCISES.map((ex) => (
          <View
            key={ex.type}
            className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
          >
            <TouchableOpacity
              className="flex-row items-center p-4"
              onPress={() => logExercise(ex)}
              disabled={isLogging}
              activeOpacity={0.7}
            >
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: `${ex.color}20` }}
              >
                <Ionicons name={ex.icon} size={24} color={ex.color} />
              </View>
              <View className="flex-1">
                <Text className="text-white text-base font-semibold">
                  {ex.label}
                </Text>
                <Text className="text-slate-400 text-sm">
                  {customDuration[ex.type] || ex.defaultDuration} min &middot; ~
                  {Math.round(
                    ((parseInt(customDuration[ex.type] || "", 10) ||
                      ex.defaultDuration) /
                      ex.defaultDuration) *
                      ex.defaultCalories
                  )}{" "}
                  cal &middot; {ex.intensity}
                </Text>
              </View>
              <Ionicons name="add-circle" size={28} color={ex.color} />
            </TouchableOpacity>
            {/* Custom duration input */}
            <View className="flex-row items-center px-4 pb-3">
              <TextInput
                className="flex-1 text-white text-sm bg-slate-700 rounded-lg px-3 py-1.5"
                placeholder={`Duration (default ${ex.defaultDuration} min)`}
                placeholderTextColor="#64748B"
                value={customDuration[ex.type] || ""}
                onChangeText={(text) =>
                  setCustomDuration((prev) => ({
                    ...prev,
                    [ex.type]: text.replace(/[^0-9]/g, ""),
                  }))
                }
                keyboardType="number-pad"
              />
            </View>
          </View>
        ))}
      </View>

      {/* Recent exercise history */}
      <Text className="text-white text-base font-semibold mb-3">
        Recent History
      </Text>
      {logs.length === 0 ? (
        <Text className="text-slate-500 text-sm text-center py-4">
          No exercises logged yet
        </Text>
      ) : (
        logs.slice(0, 8).map((log) => {
          const ex = EXERCISES.find((e) => e.type === log.exerciseType);
          return (
            <View
              key={log._id}
              className="flex-row items-center justify-between bg-slate-800 rounded-xl px-4 py-3 mb-2"
            >
              <View className="flex-row items-center flex-1">
                <Ionicons
                  name={ex?.icon || "fitness-outline"}
                  size={20}
                  color={ex?.color || "#94A3B8"}
                />
                <View className="ml-3 flex-1">
                  <Text className="text-white text-sm font-medium">
                    {ex?.label || log.exerciseType}
                  </Text>
                  <Text className="text-slate-400 text-xs">
                    {log.duration} min &middot;{" "}
                    {log.caloriesBurned ?? 0} cal &middot; {log.intensity}
                  </Text>
                </View>
              </View>
              <Text className="text-slate-500 text-xs">
                {new Date(log.date || log.createdAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────
// BREATHING TAB (client-side only, unchanged)
// ─────────────────────────────────────────────────────────
function BreathingTab() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [countdown, setCountdown] = useState(4);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function startBreathing() {
    setIsActive(true);
    setPhase("inhale");
    setCountdown(4);

    let currentPhase: "inhale" | "hold" | "exhale" = "inhale";
    let count = 4;

    intervalRef.current = setInterval(() => {
      count--;
      if (count <= 0) {
        if (currentPhase === "inhale") {
          currentPhase = "hold";
          count = 7;
        } else if (currentPhase === "hold") {
          currentPhase = "exhale";
          count = 8;
        } else {
          currentPhase = "inhale";
          count = 4;
        }
        setPhase(currentPhase);
      }
      setCountdown(count);
    }, 1000);

    // Auto-stop after 2 minutes
    timeoutRef.current = setTimeout(() => {
      stopBreathing();
      Alert.alert("Well done!", "You completed a breathing exercise.");
    }, 120000);
  }

  function stopBreathing() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    timeoutRef.current = null;
    setIsActive(false);
    setPhase("inhale");
    setCountdown(4);
  }

  const phaseColors = {
    inhale: "#3B82F6",
    hold: "#F59E0B",
    exhale: "#10B981",
  };

  const phaseLabels = {
    inhale: "Breathe In",
    hold: "Hold",
    exhale: "Breathe Out",
  };

  return (
    <View className="flex-1 items-center justify-center px-5">
      <View
        className="w-48 h-48 rounded-full items-center justify-center mb-8"
        style={{
          backgroundColor: `${phaseColors[phase]}20`,
          borderWidth: 3,
          borderColor: phaseColors[phase],
        }}
      >
        {isActive ? (
          <>
            <Text
              className="text-5xl font-extrabold"
              style={{ color: phaseColors[phase] }}
            >
              {countdown}
            </Text>
            <Text
              className="text-base font-semibold mt-2"
              style={{ color: phaseColors[phase] }}
            >
              {phaseLabels[phase]}
            </Text>
          </>
        ) : (
          <>
            <Ionicons name="leaf" size={48} color="#10B981" />
            <Text className="text-slate-400 text-sm mt-2">4-7-8 Method</Text>
          </>
        )}
      </View>

      <Text className="text-white text-xl font-bold text-center mb-2">
        {isActive ? "Focus on your breath" : "Breathing Exercise"}
      </Text>
      <Text className="text-slate-400 text-sm text-center mb-8 px-8">
        {isActive
          ? "Follow the rhythm: Inhale 4s, Hold 7s, Exhale 8s"
          : "The 4-7-8 breathing technique helps reduce anxiety and improve sleep"}
      </Text>

      <Button
        title={isActive ? "Stop" : "Start Breathing"}
        variant={isActive ? "danger" : "primary"}
        onPress={() => {
          if (isActive) {
            stopBreathing();
          } else {
            startBreathing();
          }
        }}
        icon={
          <Ionicons
            name={isActive ? "stop" : "play"}
            size={18}
            color={isActive ? "#F8FAFC" : "#0F172A"}
          />
        }
        className="w-full"
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// BREAKS TAB
// ─────────────────────────────────────────────────────────
const BREAK_TYPES: {
  type: BreakType;
  label: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  durationSecs: number;
}[] = [
  {
    type: "stretching",
    label: "Stretch Break",
    desc: "Stand up and stretch for 2 minutes",
    icon: "body-outline",
    color: "#FB923C",
    durationSecs: 120,
  },
  {
    type: "walking",
    label: "Walk Break",
    desc: "Take a short 5-minute walk",
    icon: "walk-outline",
    color: "#10B981",
    durationSecs: 300,
  },
  {
    type: "breathing",
    label: "Breathing Break",
    desc: "Deep breathing for 1 minute",
    icon: "leaf-outline",
    color: "#A78BFA",
    durationSecs: 60,
  },
  {
    type: "meditation",
    label: "Meditation Break",
    desc: "Quiet your mind for 3 minutes",
    icon: "flower-outline",
    color: "#3B82F6",
    durationSecs: 180,
  },
  {
    type: "other",
    label: "Quick Break",
    desc: "Any micro-break for 1 minute",
    icon: "cafe-outline",
    color: "#F59E0B",
    durationSecs: 60,
  },
];

function BreaksTab() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<BreakLog[]>([]);
  const [activeBreak, setActiveBreak] = useState<BreakType | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isLogging, setIsLogging] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchLogs();
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, [])
  );

  async function fetchLogs() {
    try {
      const res = await activitiesApi.getBreaks({ limit: 20 });
      setLogs(res.data.logs || []);
    } catch {
      // silently fail
    }
  }

  function startBreakTimer(breakDef: (typeof BREAK_TYPES)[0]) {
    setActiveBreak(breakDef.type);
    setCountdown(breakDef.durationSecs);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          finishBreak(breakDef);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function cancelBreakTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setActiveBreak(null);
    setCountdown(0);
  }

  async function finishBreak(breakDef: (typeof BREAK_TYPES)[0]) {
    if (!user?.id) return;
    setActiveBreak(null);
    setIsLogging(true);
    try {
      await activitiesApi.logBreak({
        userId: user.id,
        sessionId: "standalone",
        breakType: breakDef.type,
        duration: breakDef.durationSecs,
      });
      Alert.alert(
        "Break Complete!",
        `${breakDef.label} logged — +15 XP earned!`
      );
      fetchLogs();
    } catch {
      Alert.alert("Error", "Failed to log break");
    } finally {
      setIsLogging(false);
    }
  }

  // Format seconds as mm:ss
  function formatTime(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  // Today's break count
  const today = new Date().toDateString();
  const todayBreaks = logs.filter(
    (l) => new Date(l.date || l.createdAt).toDateString() === today
  ).length;

  return (
    <ScrollView contentContainerClassName="px-5 pb-8">
      {/* Today's summary */}
      <Card variant="elevated" className="mb-5 items-center py-4">
        <Ionicons name="cafe" size={24} color="#10B981" />
        <Text className="text-white text-xl font-bold mt-1">
          {todayBreaks}
        </Text>
        <Text className="text-slate-400 text-sm">breaks taken today</Text>
      </Card>

      {/* Active break timer */}
      {activeBreak && (
        <Card
          variant="elevated"
          className="mb-5 items-center py-6"
        >
          {(() => {
            const def = BREAK_TYPES.find((b) => b.type === activeBreak);
            return (
              <>
                <View
                  className="w-24 h-24 rounded-full items-center justify-center mb-3"
                  style={{
                    backgroundColor: `${def?.color || "#10B981"}20`,
                    borderWidth: 3,
                    borderColor: def?.color || "#10B981",
                  }}
                >
                  <Text
                    className="text-3xl font-extrabold"
                    style={{ color: def?.color || "#10B981" }}
                  >
                    {formatTime(countdown)}
                  </Text>
                </View>
                <Text className="text-white text-lg font-bold">
                  {def?.label || "Break"}
                </Text>
                <Text className="text-slate-400 text-sm mt-1 mb-4">
                  Take your time, you earned this!
                </Text>
                <Button
                  title="Skip & Log"
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    cancelBreakTimer();
                    if (def) finishBreak(def);
                  }}
                />
              </>
            );
          })()}
        </Card>
      )}

      {/* Break type cards */}
      <Text className="text-white text-base font-semibold mb-3">
        Take a Micro-Break
      </Text>
      <Text className="text-slate-400 text-sm mb-4">
        Start a timer and earn XP when complete
      </Text>
      <View className="gap-3 mb-6">
        {BREAK_TYPES.map((b) => (
          <TouchableOpacity
            key={b.type}
            className="flex-row items-center bg-slate-800 rounded-xl p-4 border border-slate-700"
            onPress={() => startBreakTimer(b)}
            disabled={!!activeBreak || isLogging}
            activeOpacity={0.7}
            style={{ opacity: activeBreak ? 0.5 : 1 }}
          >
            <View
              className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
              style={{ backgroundColor: `${b.color}20` }}
            >
              <Ionicons name={b.icon} size={28} color={b.color} />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-semibold">
                {b.label}
              </Text>
              <Text className="text-slate-400 text-sm mt-0.5">{b.desc}</Text>
            </View>
            <View className="bg-slate-700 px-2.5 py-1 rounded-lg">
              <Text className="text-slate-300 text-xs font-medium">
                {formatTime(b.durationSecs)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent break history */}
      <Text className="text-white text-base font-semibold mb-3">
        Recent Breaks
      </Text>
      {logs.length === 0 ? (
        <Text className="text-slate-500 text-sm text-center py-4">
          No breaks logged yet
        </Text>
      ) : (
        logs.slice(0, 8).map((log) => {
          const def = BREAK_TYPES.find((b) => b.type === log.breakType);
          return (
            <View
              key={log._id}
              className="flex-row items-center justify-between bg-slate-800 rounded-xl px-4 py-3 mb-2"
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={def?.icon || "cafe-outline"}
                  size={18}
                  color={def?.color || "#94A3B8"}
                />
                <Text className="text-white text-sm ml-3 font-medium">
                  {def?.label || log.breakType}
                </Text>
              </View>
              <Text className="text-slate-500 text-xs">
                {new Date(log.date || log.createdAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}
