/**
 * Settings tab - Profile, notifications, preferences, logout
 */
import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, router } from "expo-router";
import type { Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/services/auth";
import { remindersApi } from "@/services/api";
import type { ReminderSetting } from "@/services/types";
import Card from "@/components/Card";
import Button from "@/components/Button";

export default function SettingsScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [reminders, setReminders] = useState<ReminderSetting[]>([
    { type: "hydration", enabled: true },
    { type: "exercise", enabled: true },
    { type: "work_session", enabled: true },
    { type: "smoking_avoidance", enabled: false },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchReminders();
    }, [])
  );

  async function fetchReminders() {
    try {
      const res = await remindersApi.getSchedule();
      if (res.data.reminders) {
        setReminders(res.data.reminders);
      }
    } catch {
      // Use defaults
    }
  }

  async function toggleReminder(type: ReminderSetting["type"]) {
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
      // Revert on failure
      setReminders(reminders);
    }
  }

  function handleLogout() {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  }

  function handleDeleteAccount() {
    Alert.alert(
      "Delete Account",
      "This action is permanent and cannot be undone. All your data will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // TODO: implement delete account API when available
            Alert.alert("Not available", "Account deletion is not yet available.");
          },
        },
      ]
    );
  }

  const reminderLabels: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
    hydration: { label: "Hydration Reminders", icon: "water-outline", color: "#3B82F6" },
    exercise: { label: "Exercise Reminders", icon: "barbell-outline", color: "#10B981" },
    work_session: { label: "Work Session Alerts", icon: "timer-outline", color: "#F59E0B" },
    smoking_avoidance: { label: "Smoking Avoidance", icon: "ban-outline", color: "#EF4444" },
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={["top"]}>
      <ScrollView contentContainerClassName="px-5 pb-12">
        {/* Header */}
        <View className="pt-4 pb-3">
          <Text className="text-white text-2xl font-bold">Settings</Text>
          <Text className="text-slate-400 text-sm mt-1">
            Manage your account & preferences
          </Text>
        </View>

        {/* Profile card */}
        <Card variant="elevated" className="mb-6">
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-emerald-500/20 items-center justify-center mr-4">
              <Text className="text-emerald-400 text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || "?"}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-bold">
                {user?.name || "User"}
              </Text>
              <Text className="text-slate-400 text-sm">{user?.email}</Text>
            </View>
            <TouchableOpacity
              className="p-2"
              onPress={() => router.push("/edit-profile" as Href)}
            >
              <Ionicons name="create-outline" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Notifications section */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-white text-lg font-bold">Notifications</Text>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => router.push("/reminders" as Href)}
          >
            <Text className="text-emerald-400 text-sm font-medium mr-1">
              Manage
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#10B981" />
          </TouchableOpacity>
        </View>
        <Card className="mb-6">
          {reminders.map((reminder, index) => {
            const config = reminderLabels[reminder.type];
            if (!config) return null;
            return (
              <View key={reminder.type}>
                <View className="flex-row items-center justify-between py-3">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-9 h-9 rounded-lg items-center justify-center mr-3"
                      style={{ backgroundColor: `${config.color}20` }}
                    >
                      <Ionicons
                        name={config.icon}
                        size={18}
                        color={config.color}
                      />
                    </View>
                    <Text className="text-white text-sm font-medium">
                      {config.label}
                    </Text>
                  </View>
                  <Switch
                    value={reminder.enabled}
                    onValueChange={() => toggleReminder(reminder.type)}
                    trackColor={{ false: "#334155", true: "#10B98160" }}
                    thumbColor={reminder.enabled ? "#10B981" : "#64748B"}
                  />
                </View>
                {index < reminders.length - 1 && (
                  <View className="h-px bg-slate-700 ml-12" />
                )}
              </View>
            );
          })}
        </Card>

        {/* Preferences */}
        <Text className="text-white text-lg font-bold mb-3">Preferences</Text>
        <Card className="mb-6">
          <SettingsRow
            icon="moon-outline"
            label="Dark Mode"
            value="On"
            color="#A78BFA"
          />
          <View className="h-px bg-slate-700 ml-12" />
          <SettingsRow
            icon="language-outline"
            label="Language"
            value="English"
            color="#3B82F6"
          />
          <View className="h-px bg-slate-700 ml-12" />
          <SettingsRow
            icon="notifications-outline"
            label="Sound Effects"
            value="On"
            color="#F59E0B"
          />
        </Card>

        {/* About */}
        <Text className="text-white text-lg font-bold mb-3">About</Text>
        <Card className="mb-6">
          <SettingsRow
            icon="information-circle-outline"
            label="App Version"
            value="1.0.0"
            color="#94A3B8"
          />
          <View className="h-px bg-slate-700 ml-12" />
          <SettingsRow
            icon="document-text-outline"
            label="Terms of Service"
            color="#94A3B8"
            showArrow
          />
          <View className="h-px bg-slate-700 ml-12" />
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            color="#94A3B8"
            showArrow
          />
        </Card>

        {/* Actions */}
        <View className="gap-3 mt-2">
          <Button
            title="Log Out"
            variant="outline"
            onPress={handleLogout}
            icon={<Ionicons name="log-out-outline" size={18} color="#10B981" />}
          />
          <Button
            title="Delete Account"
            variant="danger"
            onPress={handleDeleteAccount}
            icon={<Ionicons name="trash-outline" size={18} color="#F8FAFC" />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  color = "#94A3B8",
  showArrow,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  color?: string;
  showArrow?: boolean;
}) {
  return (
    <TouchableOpacity className="flex-row items-center justify-between py-3">
      <View className="flex-row items-center flex-1">
        <View
          className="w-9 h-9 rounded-lg items-center justify-center mr-3"
          style={{ backgroundColor: `${color}20` }}
        >
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text className="text-white text-sm font-medium">{label}</Text>
      </View>
      <View className="flex-row items-center">
        {value && (
          <Text className="text-slate-400 text-sm mr-2">{value}</Text>
        )}
        {showArrow && (
          <Ionicons name="chevron-forward" size={18} color="#64748B" />
        )}
      </View>
    </TouchableOpacity>
  );
}
