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

export default function SignupScreen() {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  function validate(): boolean {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function clearError(field: keyof typeof errors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSignup() {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await signup({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      router.replace("/(onboarding)/welcome" as Href);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Signup failed. Try again.";
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
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-2xl bg-emerald-500 items-center justify-center mb-4">
            <Ionicons name="heart-half" size={40} color="#0F172A" />
          </View>
          <Text className="text-3xl font-bold text-white tracking-tight">
            Create Account
          </Text>
          <Text className="text-slate-400 text-base mt-2">
            Start your wellness journey
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <Input
            label="Full Name"
            icon="person-outline"
            placeholder="John Doe"
            value={name}
            onChangeText={(text) => {
              setName(text);
              clearError("name");
            }}
            autoCapitalize="words"
            error={errors.name}
          />

          <Input
            label="Email"
            icon="mail-outline"
            placeholder="you@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              clearError("email");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
          />

          <Input
            label="Password"
            icon="lock-closed-outline"
            placeholder="Min. 6 characters"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              clearError("password");
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

          <Input
            label="Confirm Password"
            icon="lock-closed-outline"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              clearError("confirmPassword");
            }}
            secureTextEntry={!showPassword}
            error={errors.confirmPassword}
          />

          <Button
            title="Create Account"
            onPress={handleSignup}
            isLoading={isLoading}
            className="mt-3"
          />
        </View>

        {/* Login link */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-slate-400 text-sm">
            Already have an account?{" "}
          </Text>
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
