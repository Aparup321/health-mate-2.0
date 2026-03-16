import mongoose, { Schema, type Document } from "mongoose";
import { z } from "zod";

export interface IHydrationLog extends Document {
  userId: string;
  date: Date;
  amount: number;
  time: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HydrationLogSchema = new Schema<IHydrationLog>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Amount must be at least 1 ml"],
      max: [5000, "Amount must be at most 5000 ml"],
    },
    time: {
      type: Date,
      required: true,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const HydrationLog = mongoose.model(
  "HydrationLog",
  HydrationLogSchema
);

/**
 * Zod validation schema for HydrationLog creation
 * Note: userId is optional (extracted from JWT)
 */
export const CreateHydrationLogSchema = z.object({
  userId: z.string().min(1, "User ID is required").optional(),
  date: z.coerce.date().optional(),
  amount: z
    .number()
    .min(1, "Amount must be at least 1 ml")
    .max(5000, "Amount must be at most 5000 ml"),
  time: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const UpdateHydrationLogSchema =
  CreateHydrationLogSchema.partial().omit({ userId: true });

// ============================================================================

export interface IBreakLog extends Document {
  userId: string;
  sessionId: string;
  breakType: "stretching" | "breathing" | "walking" | "meditation" | "other";
  duration: number;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BreakLogSchema = new Schema<IBreakLog>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    breakType: {
      type: String,
      enum: ["stretching", "breathing", "walking", "meditation", "other"],
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: [1, "Duration must be at least 1 second"],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const BreakLog = mongoose.model("BreakLog", BreakLogSchema);

/**
 * Zod validation schema for BreakLog creation
 * Note: userId is optional (extracted from JWT), sessionId can be optional for manual breaks
 */
export const CreateBreakLogSchema = z.object({
  userId: z.string().min(1, "User ID is required").optional(),
  sessionId: z.string().min(1, "Session ID is required").optional(),
  breakType: z.enum([
     "stretching",
     "breathing",
     "walking",
     "meditation",
     "other",
   ]),
   duration: z.number().min(1, "Duration must be at least 1 second"),
   date: z.coerce.date().optional(),
   notes: z.string().optional(),
});

export const UpdateBreakLogSchema =
  CreateBreakLogSchema.partial().omit({ userId: true });

// ============================================================================

export interface ISmokingLog extends Document {
  userId: string;
  date: Date;
  cigarettesSmoked: number;
  time: Date;
  cravingLevel: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SmokingLogSchema = new Schema<ISmokingLog>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    cigarettesSmoked: {
      type: Number,
      required: true,
      min: [0, "Cigarettes smoked must be non-negative"],
      max: [50, "Cigarettes smoked must be at most 50"],
    },
    time: {
      type: Date,
      required: true,
      default: Date.now,
    },
    cravingLevel: {
      type: Number,
      required: true,
      min: [0, "Craving level must be between 0 and 10"],
      max: [10, "Craving level must be between 0 and 10"],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const SmokingLog = mongoose.model("SmokingLog", SmokingLogSchema);

/**
 * Zod validation schema for SmokingLog creation
 * Note: userId is optional (extracted from JWT)
 */
export const CreateSmokingLogSchema = z.object({
  userId: z.string().min(1, "User ID is required").optional(),
  date: z.coerce.date().optional(),
  cigarettesSmoked: z
    .number()
    .min(0, "Cigarettes smoked must be non-negative")
    .max(50, "Cigarettes smoked must be at most 50"),
  time: z.coerce.date().optional(),
  cravingLevel: z
    .number()
    .min(0, "Craving level must be between 0 and 10")
    .max(10, "Craving level must be between 0 and 10"),
  notes: z.string().optional(),
});

export const UpdateSmokingLogSchema =
  CreateSmokingLogSchema.partial().omit({ userId: true });

// ============================================================================

export interface IExercise extends Document {
  userId: string;
  date: Date;
  exerciseType:
    | "running"
    | "walking"
    | "cycling"
    | "gym"
    | "yoga"
    | "swimming"
    | "sports"
    | "other";
  duration: number;
  intensity: "low" | "medium" | "high";
  caloriesBurned?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema = new Schema<IExercise>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    exerciseType: {
      type: String,
      enum: [
        "running",
        "walking",
        "cycling",
        "gym",
        "yoga",
        "swimming",
        "sports",
        "other",
      ],
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: [1, "Duration must be at least 1 minute"],
    },
    intensity: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
    caloriesBurned: {
      type: Number,
      min: [0, "Calories burned must be non-negative"],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Exercise = mongoose.model("Exercise", ExerciseSchema);

/**
 * Zod validation schema for Exercise creation
 */
export const CreateExerciseSchema = z.object({
  userId: z.string().min(1, "User ID is required").optional(),
  date: z.coerce.date().optional(),
  exerciseType: z.enum([
    "running",
    "walking",
    "cycling",
    "gym",
    "yoga",
    "swimming",
    "sports",
    "other",
  ]),
  duration: z
    .number()
    .min(1, "Duration must be at least 1 minute"),
  intensity: z.enum(["low", "medium", "high"]),
  caloriesBurned: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export const UpdateExerciseSchema =
  CreateExerciseSchema.partial().omit({ userId: true });
