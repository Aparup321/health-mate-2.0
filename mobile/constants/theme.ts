/**
 * HealthMate Design System
 * Based on Section 10 of the design spec
 * Dark theme is the primary theme
 */

export const Colors = {
  dark: {
    // Core backgrounds
    background: "#0F172A",       // slate-900, main app background
    surface: "#1E293B",          // slate-800, cards/containers
    surfaceLight: "#334155",     // slate-700, elevated surfaces
    border: "#334155",           // slate-700, borders/dividers
    borderLight: "#475569",      // slate-600, lighter borders

    // Text
    text: "#F8FAFC",             // slate-50, primary text
    textSecondary: "#94A3B8",    // slate-400, secondary text
    textMuted: "#64748B",        // slate-500, placeholder/muted text
    textInverse: "#0F172A",      // slate-900, text on bright buttons

    // Brand / Accent
    primary: "#10B981",          // emerald-500, primary CTA
    primaryDark: "#047857",      // emerald-700, pressed state
    primaryLight: "#34D399",     // emerald-400, links/highlights

    // Status colors
    success: "#22C55E",          // green-500
    warning: "#F59E0B",          // amber-500
    error: "#EF4444",            // red-500
    errorLight: "#F87171",       // red-400
    info: "#3B82F6",             // blue-500

    // Gamification
    xp: "#A78BFA",              // violet-400, XP indicators
    coins: "#FBBF24",           // amber-400, coin indicators
    streak: "#FB923C",          // orange-400, streak fire

    // Tier colors
    tierBronze: "#CD7F32",
    tierSilver: "#C0C0C0",
    tierGold: "#FFD700",

    // Tab bar
    tabBar: "#1E293B",          // slate-800
    tabActive: "#10B981",       // emerald-500
    tabInactive: "#64748B",     // slate-500
  },

  light: {
    background: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceLight: "#F1F5F9",
    border: "#E2E8F0",
    borderLight: "#CBD5E1",
    text: "#0F172A",
    textSecondary: "#475569",
    textMuted: "#94A3B8",
    textInverse: "#F8FAFC",
    primary: "#10B981",
    primaryDark: "#047857",
    primaryLight: "#34D399",
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    errorLight: "#F87171",
    info: "#3B82F6",
    xp: "#7C3AED",
    coins: "#D97706",
    streak: "#EA580C",
    tierBronze: "#CD7F32",
    tierSilver: "#C0C0C0",
    tierGold: "#FFD700",
    tabBar: "#FFFFFF",
    tabActive: "#10B981",
    tabInactive: "#94A3B8",
  },
} as const;

/** Typography sizes (React Native) */
export const Typography = {
  h1: { fontSize: 32, lineHeight: 40, fontWeight: "800" as const },
  h2: { fontSize: 24, lineHeight: 32, fontWeight: "700" as const },
  h3: { fontSize: 20, lineHeight: 28, fontWeight: "600" as const },
  h4: { fontSize: 18, lineHeight: 24, fontWeight: "600" as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400" as const },
  bodyBold: { fontSize: 16, lineHeight: 24, fontWeight: "600" as const },
  small: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
  smallBold: { fontSize: 14, lineHeight: 20, fontWeight: "600" as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" as const },
  captionBold: { fontSize: 12, lineHeight: 16, fontWeight: "700" as const },
  button: { fontSize: 16, lineHeight: 24, fontWeight: "700" as const },
  buttonSmall: { fontSize: 14, lineHeight: 20, fontWeight: "600" as const },
  stat: { fontSize: 36, lineHeight: 44, fontWeight: "800" as const },
} as const;

/** 8dp spacing grid */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
  "5xl": 64,
} as const;

/** Border radius */
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

/** Gamification constants */
export const Gamification = {
  /** XP thresholds per level */
  xpPerLevel: [
    0, 100, 250, 500, 1000, 1800, 3000, 5000, 8000, 12000,
  ],
  /** Tier thresholds */
  tiers: {
    bronze: { min: 0, max: 999, label: "Bronze", color: "#CD7F32" },
    silver: { min: 1000, max: 4999, label: "Silver", color: "#C0C0C0" },
    gold: { min: 5000, max: Infinity, label: "Gold", color: "#FFD700" },
  },
  /** Coin rewards */
  coins: {
    hydration: 5,
    exercise: 10,
    breakTaken: 5,
    sessionComplete: 15,
    dailyGoal: 25,
    streakBonus: 10,
  },
} as const;

/** Default to dark theme */
export const theme = Colors.dark;
