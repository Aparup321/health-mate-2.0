/**
 * Reminders Screen - Detailed reminder schedule management
 * Accessible as a modal from Settings or Dashboard
 */
import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { remindersApi } from "@/services/api";
import type { ReminderSetting, ReminderType } from "@/services/types";
import Card from "@/components/Card";
import Button from "@/components/Button";

interface ReminderConfig {
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  schedule: string;
  benefits: string[];
}

const reminderConfigs: Record<ReminderType, ReminderConfig> = {
  hydration: {
    label: "Hydration",
    description: "Stay hydrated throughout the day",
    icon: "water",
    color: "#3B82F6",
    schedule: "Every 2 hours (9 AM - 9 PM)",
    benefits: [
      "Improves focus and productivity",
      "Boosts energy levels",
      "Supports overall health",
    ],
  },
  exercise: {
    label: "Exercise",
    description: "Daily exercise reminder",
    icon: "barbell",
    color: "#10B981",
    schedule: "Daily at 6:00 PM",
    benefits: [
      "Reduces stress and anxiety",
      "Improves sleep quality",
      "Increases energy throughout the day",
    ],
  },
  work_session: {
    label: "Work Session Breaks",
    description: "Take breaks during work sessions",
    icon: "timer",
    color: "#F59E0B",
    schedule: "Every 25 minutes during active sessions",
    benefits: [
      "Prevents burnout",
      "Maintains focus and concentration",
      "Reduces eye strain",
    ],
  },
  smoking_avoidance: {
    label: "Smoking Avoidance",
    description: "Motivational reminders to stay smoke-free",
    icon: "ban",
    color: "#EF4444",
    schedule: "3 times daily (9 AM, 2 PM, 8 PM)",
    benefits: [
      "Track your smoke-free journey",
      "Get motivation at craving times",
      "Celebrate milestones",
    ],
  },
};

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<ReminderSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedType, setExpandedType] = useState<ReminderType | null>(null);
  const [testingType, setTestingType] = useState<ReminderType | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchReminders();
    }, [])
  );

  async function fetchReminders() {
    setIsLoading(true);
    try {
      const res = await remindersApi.getSchedule();
      setReminders(res.data.reminders || []);
    } catch {
      // Use defaults
      setReminders([
        { type: "hydration", enabled: true },
        { type: "exercise", enabled: true },
        { type: "work_session", enabled: true },
        { type: "smoking_avoidance", enabled: false },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleReminder(type: ReminderType) {
    const current = reminders.find((r) => r.type === type);
    if (!current) return;

    const newEnabled = !current.enabled;
    const updated = reminders.map((r) =>
      r.type === type ? { ...r, enabled: newEnabled } : r
    );
    setReminders(updated);

    try {
      await remindersApi.updateReminder({ reminderType: type, enabled: newEnabled });
    } catch {
      setReminders(reminders);
      Alert.alert("Error", "Could not update reminder setting.");
    }
  }

  async function handleTestReminder(type: ReminderType) {
    setTestingType(type);
    try {
      await remindersApi.sendTest(type);
      Alert.alert(
        "Test Sent",
        `A test ${reminderConfigs[type].label.toLowerCase()} reminder has been sent. Check your server logs.`
      );
    } catch {
      Alert.alert("Error", "Could not send test reminder.");
    } finally {
      setTestingType(null);
    }
  }

  function isEnabled(type: ReminderType): boolean {
    return reminders.find((r) => r.type === type)?.enabled ?? false;
  }

  const enabledCount = reminders.filter((r) => r.enabled).length;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={["top"]}>
      <ScrollView contentContainerClassName="px-5 pb-12">
        {/* Header with close button */}
        <View className="flex-row items-center justify-between pt-4 pb-1">
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold">Reminders</Text>
            <Text className="text-slate-400 text-sm mt-1">
              Manage your wellness nudges
            </Text>
          </View>
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center"
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={22} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Summary card */}
        <Card variant="elevated" className="mt-4 mb-6">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-xl bg-emerald-500/20 items-center justify-center mr-3">
              <Ionicons name="notifications" size={24} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-bold">
                {enabledCount} of {reminders.length} Active
              </Text>
              <Text className="text-slate-400 text-sm">
                {enabledCount === 0
                  ? "Enable reminders to stay on track"
                  : enabledCount === reminders.length
                    ? "All reminders are active"
                    : `${reminders.length - enabledCount} reminder${
                        reminders.length - enabledCount > 1 ? "s" : ""
                      } disabled`}
              </Text>
            </View>
          </View>

          {/* Quick toggle bar */}
          <View className="flex-row mt-4 gap-2">
            {(Object.keys(reminderConfigs) as ReminderType[]).map((type) => {
              const config = reminderConfigs[type];
              const enabled = isEnabled(type);
              return (
                <TouchableOpacity
                  key={type}
                  className={`flex-1 items-center py-2 rounded-lg ${
                    enabled ? "bg-slate-700/50" : "bg-slate-900/50"
                  }`}
                  onPress={() => toggleReminder(type)}
                >
                  <Ionicons
                    name={config.icon}
                    size={18}
                    color={enabled ? config.color : "#475569"}
                  />
                  <Text
                    className={`text-[10px] mt-0.5 ${
                      enabled ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {config.label.split(" ")[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Reminder cards */}
        <Text className="text-white text-lg font-bold mb-3">
          Reminder Schedule
        </Text>

        {(Object.keys(reminderConfigs) as ReminderType[]).map((type) => {
          const config = reminderConfigs[type];
          const enabled = isEnabled(type);
          const isExpanded = expandedType === type;

          return (
            <Card
              key={type}
              className={`mb-3 ${!enabled ? "opacity-60" : ""}`}
              variant={isExpanded ? "elevated" : "default"}
            >
              {/* Main row */}
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() =>
                  setExpandedType(isExpanded ? null : type)
                }
                activeOpacity={0.7}
              >
                <View
                  className="w-11 h-11 rounded-xl items-center justify-center mr-3"
                  style={{
                    backgroundColor: enabled
                      ? `${config.color}20`
                      : "#1E293B",
                  }}
                >
                  <Ionicons
                    name={config.icon}
                    size={22}
                    color={enabled ? config.color : "#475569"}
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-white text-base font-semibold">
                    {config.label}
                  </Text>
                  <Text className="text-slate-400 text-xs mt-0.5">
                    {config.description}
                  </Text>
                </View>

                <Switch
                  value={enabled}
                  onValueChange={() => toggleReminder(type)}
                  trackColor={{ false: "#334155", true: `${config.color}60` }}
                  thumbColor={enabled ? config.color : "#64748B"}
                />
              </TouchableOpacity>

              {/* Expanded details */}
              {isExpanded && (
                <View className="mt-4 pt-3 border-t border-slate-700">
                  {/* Schedule info */}
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="time-outline" size={16} color="#94A3B8" />
                    <Text className="text-slate-300 text-sm ml-2">
                      {config.schedule}
                    </Text>
                  </View>

                  {/* Benefits */}
                  <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Benefits
                  </Text>
                  {config.benefits.map((benefit, i) => (
                    <View key={i} className="flex-row items-start mb-1.5">
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color={config.color}
                        style={{ marginTop: 2 }}
                      />
                      <Text className="text-slate-300 text-sm ml-2 flex-1">
                        {benefit}
                      </Text>
                    </View>
                  ))}

                  {/* Test button */}
                  {enabled && (
                    <TouchableOpacity
                      className="flex-row items-center justify-center mt-3 py-2.5 bg-slate-900/60 rounded-lg"
                      onPress={() => handleTestReminder(type)}
                      disabled={testingType === type}
                    >
                      {testingType === type ? (
                        <ActivityIndicator size="small" color={config.color} />
                      ) : (
                        <>
                          <Ionicons
                            name="paper-plane-outline"
                            size={14}
                            color={config.color}
                          />
                          <Text
                            className="text-sm font-medium ml-1.5"
                            style={{ color: config.color }}
                          >
                            Send Test Reminder
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </Card>
          );
        })}

        {/* Info footer */}
        <Card className="mt-3" variant="outlined">
          <View className="flex-row items-start">
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#64748B"
              style={{ marginTop: 1 }}
            />
            <Text className="text-slate-500 text-xs ml-2 flex-1">
              Reminders are processed server-side. Push notifications will be
              available in future updates. Currently, reminders are logged on the
              server for tracking purposes.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
