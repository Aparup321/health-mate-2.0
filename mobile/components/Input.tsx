/**
 * Reusable Input component with icon, error state, label
 */
import { View, Text, TextInput, type TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightElement?: React.ReactNode;
}

export default function Input({
  label,
  error,
  icon,
  rightElement,
  className,
  ...props
}: InputProps) {
  return (
    <View className={className}>
      {label && (
        <Text className="text-slate-300 text-sm font-medium mb-2 ml-1">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center bg-slate-800 rounded-xl px-4 border ${
          error ? "border-red-500" : "border-slate-700"
        }`}
      >
        {icon && (
          <Ionicons name={icon} size={20} color="#94A3B8" />
        )}
        <TextInput
          className={`flex-1 text-white text-base py-4 ${icon ? "ml-3" : ""}`}
          placeholderTextColor="#64748B"
          {...props}
        />
        {rightElement}
      </View>
      {error && (
        <Text className="text-red-400 text-xs mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
}
