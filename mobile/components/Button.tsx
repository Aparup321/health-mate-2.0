/**
 * Reusable Button component
 * Supports primary, secondary, outline, ghost variants
 */
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: "bg-emerald-500 active:bg-emerald-700",
    text: "text-slate-900 font-bold",
  },
  secondary: {
    container: "bg-slate-700 active:bg-slate-600",
    text: "text-white font-bold",
  },
  outline: {
    container: "bg-transparent border border-emerald-500 active:bg-emerald-500/10",
    text: "text-emerald-400 font-bold",
  },
  ghost: {
    container: "bg-transparent active:bg-slate-800",
    text: "text-emerald-400 font-medium",
  },
  danger: {
    container: "bg-red-500 active:bg-red-700",
    text: "text-white font-bold",
  },
};

const sizeClasses: Record<ButtonSize, { container: string; text: string }> = {
  sm: { container: "py-2 px-4 rounded-lg", text: "text-sm" },
  md: { container: "py-3.5 px-6 rounded-xl", text: "text-base" },
  lg: { container: "py-4 px-8 rounded-xl", text: "text-lg" },
};

export default function Button({
  title,
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const v = variantClasses[variant];
  const s = sizeClasses[size];
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center ${s.container} ${v.container} ${
        isDisabled ? "opacity-50" : ""
      } ${className || ""}`}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#0F172A" : "#10B981"}
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            className={`${v.text} ${s.text} ${icon ? "ml-2" : ""}`}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
