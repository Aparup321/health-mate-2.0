import mongoose, { Schema, type Document } from "mongoose";
import { z } from "zod";

export interface IAchievement extends Document {
  userId: string;
  badgeType:
    | "first_steps"
    | "kickstarter"
    | "week_warrior"
    | "hydration_hero"
    | "water_master"
    | "break_master"
    | "perfect_session"
    | "exercise_enthusiast"
    | "fitness_fanatic"
    | "smoke_free_week"
    | "smoke_free_month"
    | "smoking_slayer"
    | "streak_keeper"
    | "perfect_week"
    | "century_club"
    | "consistency_king"
    | "rising_star"
    | "local_champion"
    | "golden_guardian"
    | "platinum_elite"
    | "leaderboard_legend";
  title: string;
  description: string;
  points: number;
  unlockedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    badgeType: {
      type: String,
      enum: [
        "first_steps",
        "kickstarter",
        "week_warrior",
        "hydration_hero",
        "water_master",
        "break_master",
        "perfect_session",
        "exercise_enthusiast",
        "fitness_fanatic",
        "smoke_free_week",
        "smoke_free_month",
        "smoking_slayer",
        "streak_keeper",
        "perfect_week",
        "century_club",
        "consistency_king",
        "rising_star",
        "local_champion",
        "golden_guardian",
        "platinum_elite",
        "leaderboard_legend",
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    points: {
      type: Number,
      required: true,
      min: [0, "Points cannot be negative"],
    },
    unlockedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export const Achievement = mongoose.model("Achievement", AchievementSchema);

/**
 * Zod validation schema for Achievement creation
 */
export const CreateAchievementSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  badgeType: z.enum([
    "first_steps",
    "kickstarter",
    "week_warrior",
    "hydration_hero",
    "water_master",
    "break_master",
    "perfect_session",
    "exercise_enthusiast",
    "fitness_fanatic",
    "smoke_free_week",
    "smoke_free_month",
    "smoking_slayer",
    "streak_keeper",
    "perfect_week",
    "century_club",
    "consistency_king",
    "rising_star",
    "local_champion",
    "golden_guardian",
    "platinum_elite",
    "leaderboard_legend",
  ]),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  points: z.number().min(0, "Points cannot be negative"),
  unlockedAt: z.date().optional(),
});

// ============================================================================

export interface IStreak extends Document {
  userId: string;
  streakType: "work_sessions" | "hydration" | "exercise" | "smoke_free";
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StreakSchema = new Schema<IStreak>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    streakType: {
      type: String,
      enum: ["work_sessions", "hydration", "exercise", "smoke_free"],
      required: true,
      index: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: [0, "Current streak cannot be negative"],
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: [0, "Longest streak cannot be negative"],
    },
    lastActivityDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export const Streak = mongoose.model("Streak", StreakSchema);

/**
 * Zod validation schema for Streak creation
 */
export const CreateStreakSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  streakType: z.enum(["work_sessions", "hydration", "exercise", "smoke_free"]),
  currentStreak: z.number().nonnegative().optional(),
  longestStreak: z.number().nonnegative().optional(),
  lastActivityDate: z.date().optional(),
});

/**
 * Zod validation schema for Streak updates
 */
export const UpdateStreakSchema = CreateStreakSchema.partial().omit({
  userId: true,
});

/**
 * Achievement definitions and their unlock conditions
 */
export const ACHIEVEMENT_DEFINITIONS = {
  first_session: {
    title: "Getting Started",
    description: "Complete your first work session",
    points: 10,
  },
  first_week: {
    title: "Week Warrior",
    description: "Complete 7 work sessions in a week",
    points: 50,
  },
  hydration_master: {
    title: "Hydration Master",
    description: "Drink your daily water intake for 7 consecutive days",
    points: 75,
  },
  break_taker: {
    title: "Break Master",
    description: "Take 50 breaks during work sessions",
    points: 100,
  },
  exercise_enthusiast: {
    title: "Exercise Enthusiast",
    description: "Complete 10 exercise sessions",
    points: 100,
  },
  smoke_free_week: {
    title: "7 Days Smoke-Free",
    description: "Avoid smoking for 7 consecutive days",
    points: 150,
  },
  smoke_free_month: {
    title: "30 Days Smoke-Free",
    description: "Avoid smoking for 30 consecutive days",
    points: 500,
  },
  perfect_week: {
    title: "Perfect Week",
    description:
      "Complete all daily goals (hydration, breaks, exercise) for 7 days",
    points: 200,
  },
  century_club: {
    id: "century_club",
    title: "Century Club",
    description: "Complete 100 work sessions",
    points: 300,
    trigger: "session_count",
    requirement: 100,
  },
  leaderboard_top_10: {
    title: "Top 10 Performer",
    description: "Reach top 10 in the global leaderboard",
    points: 250,
  },
};
