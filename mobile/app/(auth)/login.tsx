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
import { useAuth } from "@/services/auth";
import Button from "@/components/Button";
import Input from "@/components/Input";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  function validate(): boolean {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
      router.replace("/(tabs)" as Href);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Invalid email or password";
      setErrors({ email: message });
    } finally {
      setIsLoading(false);
    }
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
        {/* Branding */}
        <View className="items-center mb-12">
          <View className="w-20 h-20 rounded-2xl bg-emerald-500 items-center justify-center mb-4">
            <Ionicons name="heart-half" size={40} color="#0F172A" />
          </View>
          <Text className="text-3xl font-bold text-white tracking-tight">
            HealthMate
          </Text>
          <Text className="text-slate-400 text-base mt-2">
            Your daily wellness companion
          </Text>
        </View>

        {/* Form */}
        <View className="gap-5">
          <Input
            label="Email"
            icon="mail-outline"
            placeholder="you@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email)
                setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
          />

          <Input
            label="Password"
            icon="lock-closed-outline"
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            secureTextEntry={!showPassword}
            error={errors.password}
            rightElement={
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            }
          />

          {/* Forgot password */}
          <TouchableOpacity
            className="self-end"
            onPress={() => router.push("/(auth)/forgot-password" as Href)}
          >
            <Text className="text-emerald-400 text-sm font-medium">
              Forgot password?
            </Text>
          </TouchableOpacity>

          {/* Login button */}
          <Button
            title="Sign In"
            onPress={handleLogin}
            isLoading={isLoading}
            className="mt-2"
          />
        </View>

        {/* Sign up link */}
        <View className="flex-row justify-center mt-10">
          <Text className="text-slate-400 text-sm">
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/signup" as Href)}
          >
            <Text className="text-emerald-400 text-sm font-bold">
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
