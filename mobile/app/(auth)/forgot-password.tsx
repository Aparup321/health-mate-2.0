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
import { router } from "expo-router";
import Button from "@/components/Button";
import Input from "@/components/Input";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: integrate with backend password reset endpoint when available
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (submitted) {
    return (
      <View className="flex-1 bg-slate-900 px-6 items-center justify-center">
        <View className="w-20 h-20 rounded-full bg-emerald-500/20 items-center justify-center mb-6">
          <Ionicons name="mail-open-outline" size={40} color="#10B981" />
        </View>
        <Text className="text-white text-2xl font-bold text-center mb-3">
          Check your email
        </Text>
        <Text className="text-slate-400 text-base text-center leading-6 mb-8">
          We've sent password reset instructions to{"\n"}
          <Text className="text-emerald-400 font-medium">{email}</Text>
        </Text>
        <Button
          title="Back to Sign In"
          variant="outline"
          onPress={() => router.back()}
          className="w-full"
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-900"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        contentContainerClassName="px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Back button */}
        <TouchableOpacity
          className="absolute top-12 left-0 p-2"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#94A3B8" />
        </TouchableOpacity>

        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-full bg-emerald-500/20 items-center justify-center mb-6">
            <Ionicons name="key-outline" size={36} color="#10B981" />
          </View>
          <Text className="text-white text-2xl font-bold text-center mb-3">
            Forgot Password?
          </Text>
          <Text className="text-slate-400 text-base text-center leading-6">
            Enter your email and we'll send you{"\n"}instructions to reset your
            password
          </Text>
        </View>

        <View className="gap-5">
          <Input
            label="Email Address"
            icon="mail-outline"
            placeholder="you@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={error}
          />

          <Button
            title="Send Reset Link"
            onPress={handleSubmit}
            isLoading={isLoading}
          />
        </View>

        <View className="flex-row justify-center mt-8">
          <Text className="text-slate-400 text-sm">Remember your password? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-emerald-400 text-sm font-bold">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
