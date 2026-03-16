/**
 * Stat card used on Dashboard, Stats screens
 * Shows a label, value, optional icon and trend
 */
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "./Card";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  iconColor = "#10B981",
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={`${className || ""}`}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-slate-400 text-sm">{label}</Text>
        {icon && <Ionicons name={icon} size={20} color={iconColor} />}
      </View>
      <Text className="text-white text-2xl font-bold">{value}</Text>
      {trend && (
        <View className="flex-row items-center mt-1">
          <Ionicons
            name={trend.positive ? "trending-up" : "trending-down"}
            size={14}
            color={trend.positive ? "#22C55E" : "#EF4444"}
          />
          <Text
            className={`text-xs ml-1 ${
              trend.positive ? "text-green-400" : "text-red-400"
            }`}
          >
            {trend.value}
          </Text>
        </View>
      )}
    </Card>
  );
}
