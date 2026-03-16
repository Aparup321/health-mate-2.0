/**
 * Progress bar / ring component for XP, hydration, goals
 */
import { View, Text } from "react-native";

interface ProgressBarProps {
  progress: number;     // 0 to 1
  label?: string;
  sublabel?: string;
  color?: string;
  height?: number;
  showPercentage?: boolean;
  className?: string;
}

export default function ProgressBar({
  progress,
  label,
  sublabel,
  color = "#10B981",
  height = 8,
  showPercentage = false,
  className,
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const percentage = Math.round(clampedProgress * 100);

  return (
    <View className={className}>
      {(label || showPercentage) && (
        <View className="flex-row items-center justify-between mb-2">
          {label && (
            <Text className="text-slate-300 text-sm font-medium">
              {label}
            </Text>
          )}
          {showPercentage && (
            <Text className="text-slate-400 text-sm">{percentage}%</Text>
          )}
        </View>
      )}
      <View
        className="bg-slate-700 rounded-full overflow-hidden"
        style={{ height }}
      >
        <View
          className="rounded-full"
          style={{
            height: "100%",
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </View>
      {sublabel && (
        <Text className="text-slate-500 text-xs mt-1">{sublabel}</Text>
      )}
    </View>
  );
}
