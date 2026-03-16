/**
 * Global constants and configuration for Health-Mate
 */

// ============================================================================
// POINTS CONFIGURATION
// ============================================================================

export const POINTS_CONFIG = {
  WORK_SESSION: 50,
  HYDRATION_LOG: 10,
  DAILY_HYDRATION_GOAL_BONUS: 20,
  EXERCISE_LOW: 30,
  EXERCISE_MEDIUM: 50,
  EXERCISE_HIGH: 75,
  BREAK_TAKEN: 15,
  ALL_BREAKS_BONUS: 10,
  NO_SMOKING_DAILY: 25,
  STREAK_3_DAY: 50,
  STREAK_7_DAY: 100,
  STREAK_14_DAY: 200,
  STREAK_30_DAY: 500,
} as const;

// ============================================================================
// TIER THRESHOLDS
// ============================================================================

export const TIER_THRESHOLDS = {
  BRONZE: { min: 0, max: 499 },
  SILVER: { min: 500, max: 1999 },
  GOLD: { min: 2000, max: 4999 },
  PLATINUM: { min: 5000, max: Infinity },
} as const;

// ============================================================================
// ACHIEVEMENTS CONFIGURATION
// ============================================================================

export const ACHIEVEMENTS_CONFIG = {
  FIRST_STEPS: {
    id: "first_steps",
    title: "First Steps",
    description: "Create health profile",
    points: 10,
    trigger: "profile_created",
  },
  KICKSTARTER: {
    id: "kickstarter",
    title: "Kickstarter",
    description: "Complete first work session",
    points: 20,
    trigger: "session_count",
    requirement: 1,
  },
  WEEK_WARRIOR: {
    id: "week_warrior",
    title: "Week Warrior",
    description: "Complete 7 work sessions in a week",
    points: 100,
    trigger: "weekly_sessions",
    requirement: 7,
  },
  HYDRATION_HERO: {
    id: "hydration_hero",
    title: "Hydration Hero",
    description: "Log water intake for 7 consecutive days",
    points: 75,
    trigger: "hydration_streak",
    requirement: 7,
  },
  WATER_MASTER: {
    id: "water_master",
    title: "Water Master",
    description: "Meet daily water goal for 30 consecutive days",
    points: 150,
    trigger: "hydration_goal_streak",
    requirement: 30,
  },
  BREAK_MASTER: {
    id: "break_master",
    title: "Break Master",
    description: "Take 50 breaks during work sessions",
    points: 100,
    trigger: "break_count",
    requirement: 50,
  },
  PERFECT_SESSION: {
    id: "perfect_session",
    title: "Perfect Session",
    description: "Complete work session with 100% break compliance",
    points: 80,
    trigger: "perfect_session",
  },
  EXERCISE_ENTHUSIAST: {
    id: "exercise_enthusiast",
    title: "Exercise Enthusiast",
    description: "Log 10 exercise sessions",
    points: 100,
    trigger: "exercise_count",
    requirement: 10,
  },
  FITNESS_FANATIC: {
    id: "fitness_fanatic",
    title: "Fitness Fanatic",
    description: "Log 50 exercise sessions",
    points: 250,
    trigger: "exercise_count",
    requirement: 50,
  },
  SMOKE_FREE_WEEK: {
    id: "smoke_free_week",
    title: "Smoke-Free Week",
    description: "7 consecutive days without smoking",
    points: 150,
    trigger: "smoke_free_streak",
    requirement: 7,
  },
  SMOKE_FREE_MONTH: {
    id: "smoke_free_month",
    title: "Smoke-Free Month",
    description: "30 consecutive days without smoking",
    points: 500,
    trigger: "smoke_free_streak",
    requirement: 30,
  },
  SMOKING_SLAYER: {
    id: "smoking_slayer",
    title: "Smoking Slayer",
    description: "100 consecutive days without smoking",
    points: 1000,
    trigger: "smoke_free_streak",
    requirement: 100,
  },
  STREAK_KEEPER: {
    id: "streak_keeper",
    title: "Streak Keeper",
    description: "Maintain any 7-day streak",
    points: 120,
    trigger: "any_streak",
    requirement: 7,
  },
  PERFECT_WEEK: {
    id: "perfect_week",
    title: "Perfect Week",
    description: "Meet all daily goals for 7 days",
    points: 200,
    trigger: "perfect_week",
  },
  CENTURY_CLUB: {
    id: "century_club",
    title: "Century Club",
    description: "Complete 100 work sessions",
    points: 300,
    trigger: "session_count",
    requirement: 100,
  },
  LEADERBOARD_LEGEND: {
    id: "leaderboard_legend",
    title: "Leaderboard Legend",
    description: "Reach top 10 in global leaderboard",
    points: 250,
    trigger: "leaderboard_rank",
    requirement: 10,
  },
  LOCAL_CHAMPION: {
    id: "local_champion",
    title: "Local Champion",
    description: "Top rank in peer challenge group",
    points: 180,
    trigger: "local_rank",
    requirement: 1,
  },
  CONSISTENCY_KING: {
    id: "consistency_king",
    title: "Consistency King",
    description: "30-day streak on work sessions",
    points: 400,
    trigger: "session_streak",
    requirement: 30,
  },
  RISING_STAR: {
    id: "rising_star",
    title: "Rising Star",
    description: "Reach Silver tier",
    points: 160,
    trigger: "tier_reached",
    requirement: 500,
  },
  GOLDEN_GUARDIAN: {
    id: "golden_guardian",
    title: "Golden Guardian",
    description: "Reach Gold tier",
    points: 200,
    trigger: "tier_reached",
    requirement: 2000,
  },
  PLATINUM_ELITE: {
    id: "platinum_elite",
    title: "Platinum Elite",
    description: "Reach Platinum tier",
    points: 400,
    trigger: "tier_reached",
    requirement: 5000,
  },
} as const;

// ============================================================================
// REMINDER CONFIGURATION
// ============================================================================

export const REMINDER_CONFIG = {
  WORK_SESSION: {
    enabled: true,
    intervalMinutes: 25,
    message: "Time for a break! 2 min stretching recommended 💪",
  },
  HYDRATION: {
    enabled: true,
    intervalMinutes: 120,
    startHour: 9,
    endHour: 21,
    messages: [
      "Remember to drink water 💧",
      "You're halfway to your daily goal!",
      "Just a bit more water to go!",
    ],
  },
  EXERCISE: {
    enabled: true,
    scheduleHour: 18,
    scheduleMinute: 0,
    message: "Ready to move? Log a quick workout session 🏃",
  },
  SMOKING_AVOIDANCE: {
    enabled: true,
    times: [9, 14, 20],
    messages: [
      "You've got this! Stay strong today 💪",
      "Keeping up the great streak!",
      "One more night of victory! 🎉",
    ],
  },
} as const;

// ============================================================================
// HEALTH & WELLNESS GOALS
// ============================================================================

export const HEALTH_GOALS = {
  DAILY_WATER_INTAKE_ML: 2000,
  DEFAULT_CALORIE_GOAL: 2000,
  WORK_SESSION_DURATION_MIN: 25,
  BREAK_FREQUENCY_MIN: 25,
  DAILY_EXERCISE_GOAL_MIN: 30,
} as const;

// ============================================================================
// BMI CATEGORIES
// ============================================================================

export const BMI_CATEGORIES = {
  UNDERWEIGHT: { min: 0, max: 18.4, label: "Underweight" },
  NORMAL: { min: 18.5, max: 24.9, label: "Normal Weight" },
  OVERWEIGHT: { min: 25, max: 29.9, label: "Overweight" },
  OBESE: { min: 30, max: Infinity, label: "Obese" },
} as const;

// ============================================================================
// PAGINATION
// ============================================================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ============================================================================
// EXERCISE TYPES
// ============================================================================

export const EXERCISE_TYPES = [
  "running",
  "walking",
  "cycling",
  "gym",
  "yoga",
  "swimming",
  "sports",
  "other",
] as const;

// ============================================================================
// BREAK TYPES
// ============================================================================

export const BREAK_TYPES = [
  "stretching",
  "breathing",
  "walking",
  "meditation",
  "other",
] as const;

// ============================================================================
// INTENSITY LEVELS
// ============================================================================

export const INTENSITY_LEVELS = ["low", "medium", "high"] as const;

// ============================================================================
// GENDERS
// ============================================================================

export const GENDERS = ["male", "female", "other"] as const;

// ============================================================================
// EXERCISE FAMILIARITY
// ============================================================================

export const EXERCISE_FAMILIARITY = ["beginner", "intermediate", "advanced"] as const;
