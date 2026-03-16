import mongoose, { Schema, type Document } from "mongoose";
import { z } from "zod";

export interface IGlobalLeaderboard extends Document {
  userId: string;
  userName: string;
  totalPoints: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  rank: number;
  sessionsCompleted: number;
  breaksTaken: number;
  exerciseCount: number;
  hydrationDays: number;
  smokeFreeStreak: number;
  updatedAt: Date;
  createdAt: Date;
}

const GlobalLeaderboardSchema = new Schema<IGlobalLeaderboard>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    totalPoints: {
      type: Number,
      default: 0,
      min: [0, "Total points cannot be negative"],
      index: true,
    },
    tier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      default: "bronze",
      index: true,
    },
    rank: {
      type: Number,
      required: true,
      default: 0,
      index: true,
    },
    sessionsCompleted: {
      type: Number,
      default: 0,
      min: [0, "Sessions completed cannot be negative"],
    },
    breaksTaken: {
      type: Number,
      default: 0,
      min: [0, "Breaks taken cannot be negative"],
    },
    exerciseCount: {
      type: Number,
      default: 0,
      min: [0, "Exercise count cannot be negative"],
    },
    hydrationDays: {
      type: Number,
      default: 0,
      min: [0, "Hydration days cannot be negative"],
    },
    smokeFreeStreak: {
      type: Number,
      default: 0,
      min: [0, "Smoke-free streak cannot be negative"],
    },
  },
  { timestamps: true }
);

// Create text index for searching users
GlobalLeaderboardSchema.index({ userName: "text" });

export const GlobalLeaderboard = mongoose.model(
  "GlobalLeaderboard",
  GlobalLeaderboardSchema
);

/**
 * Determine tier based on total points
 * @param points - Total points earned
 * @returns Tier name
 */
export function determineTier(
  points: number
): "bronze" | "silver" | "gold" | "platinum" {
  if (points >= 5000) return "platinum";
  if (points >= 2000) return "gold";
  if (points >= 500) return "silver";
  return "bronze";
}

/**
 * Zod validation schema for GlobalLeaderboard creation
 */
export const CreateGlobalLeaderboardSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  userName: z.string().min(1, "User name is required"),
  totalPoints: z.number().nonnegative().optional(),
  tier: z
    .enum(["bronze", "silver", "gold", "platinum"])
    .optional(),
  sessionsCompleted: z.number().nonnegative().optional(),
  breaksTaken: z.number().nonnegative().optional(),
  exerciseCount: z.number().nonnegative().optional(),
  hydrationDays: z.number().nonnegative().optional(),
  smokeFreeStreak: z.number().nonnegative().optional(),
});

/**
 * Zod validation schema for GlobalLeaderboard updates
 */
export const UpdateGlobalLeaderboardSchema =
  CreateGlobalLeaderboardSchema.partial().omit({ userId: true });

// ============================================================================

export interface ILocalLeaderboard extends Document {
  userId: string;
  groupId: string;
  userName: string;
  totalPoints: number;
  rank: number;
  sessionsCompleted: number;
  breaksTaken: number;
  exerciseCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const LocalLeaderboardSchema = new Schema<ILocalLeaderboard>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    groupId: {
      type: String,
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    totalPoints: {
      type: Number,
      default: 0,
      min: [0, "Total points cannot be negative"],
      index: true,
    },
    rank: {
      type: Number,
      required: true,
      default: 0,
      index: true,
    },
    sessionsCompleted: {
      type: Number,
      default: 0,
      min: [0, "Sessions completed cannot be negative"],
    },
    breaksTaken: {
      type: Number,
      default: 0,
      min: [0, "Breaks taken cannot be negative"],
    },
    exerciseCount: {
      type: Number,
      default: 0,
      min: [0, "Exercise count cannot be negative"],
    },
  },
  { timestamps: true }
);

// Compound index for quick leaderboard fetching
LocalLeaderboardSchema.index({ groupId: 1, totalPoints: -1 });

export const LocalLeaderboard = mongoose.model(
  "LocalLeaderboard",
  LocalLeaderboardSchema
);

/**
 * Zod validation schema for LocalLeaderboard creation
 */
export const CreateLocalLeaderboardSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  groupId: z.string().min(1, "Group ID is required"),
  userName: z.string().min(1, "User name is required"),
  totalPoints: z.number().nonnegative().optional(),
  sessionsCompleted: z.number().nonnegative().optional(),
  breaksTaken: z.number().nonnegative().optional(),
  exerciseCount: z.number().nonnegative().optional(),
});

/**
 * Zod validation schema for LocalLeaderboard updates
 */
export const UpdateLocalLeaderboardSchema =
  CreateLocalLeaderboardSchema.partial().omit({ userId: true, groupId: true });

// ============================================================================

export interface IPeerChallenge extends Document {
  groupId: string;
  groupName: string;
  creatorId: string;
  members: string[];
  challengeType:
    | "hydration"
    | "exercise"
    | "breaks"
    | "smoke_free"
    | "overall";
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PeerChallengeSchema = new Schema<IPeerChallenge>(
  {
    groupId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    groupName: {
      type: String,
      required: true,
      trim: true,
    },
    creatorId: {
      type: String,
      required: true,
      index: true,
    },
    members: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "Group must have at least one member",
      },
    },
    challengeType: {
      type: String,
      enum: ["hydration", "exercise", "breaks", "smoke_free", "overall"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const PeerChallenge = mongoose.model(
  "PeerChallenge",
  PeerChallengeSchema
);

/**
 * Zod validation schema for PeerChallenge creation
 */
export const CreatePeerChallengeSchema = z.object({
  groupId: z.string().min(1, "Group ID is required"),
  groupName: z.string().min(1, "Group name is required"),
  creatorId: z.string().min(1, "Creator ID is required"),
  members: z.array(z.string()).min(1, "Group must have at least one member"),
  challengeType: z.enum([
    "hydration",
    "exercise",
     "breaks",
     "smoke_free",
     "overall",
   ]),
   startDate: z.coerce.date(),
   endDate: z.coerce.date(),
 });

/**
 * Zod validation schema for PeerChallenge updates
 */
export const UpdatePeerChallengeSchema =
  CreatePeerChallengeSchema.partial().omit({ groupId: true });
