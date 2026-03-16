/**
 * Reusable Card component for surfaces/containers
 */
import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  variant?: "default" | "elevated" | "outlined";
}

export default function Card({
  variant = "default",
  className,
  children,
  ...props
}: CardProps) {
  const variantClass = {
    default: "bg-slate-800 rounded-2xl",
    elevated: "bg-slate-800 rounded-2xl shadow-lg shadow-black/30",
    outlined: "bg-slate-800/50 rounded-2xl border border-slate-700",
  }[variant];

  return (
    <View className={`p-4 ${variantClass} ${className || ""}`} {...props}>
      {children}
    </View>
  );
}
