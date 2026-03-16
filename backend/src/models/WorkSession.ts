import mongoose, { Schema, type Document } from "mongoose";
import { z } from "zod";

export interface IWorkSession extends Document {
  userId: string;
  sessionDate: Date;
  duration: number;
  workDuration: number;
  breaksTaken: number;
  breaksScheduled: number;
  hydrationRemindersReceived: number;
  hydrationRemindersActedOn: number;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkSessionSchema = new Schema<IWorkSession>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    sessionDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    duration: {
      type: Number,
      required: true,
      min: [1, "Session duration must be at least 1 minute"],
    },
    workDuration: {
      type: Number,
      required: true,
      min: [1, "Work duration must be at least 1 minute"],
    },
    breaksTaken: {
      type: Number,
      default: 0,
      min: 0,
    },
    breaksScheduled: {
      type: Number,
      default: 0,
      min: 0,
    },
    hydrationRemindersReceived: {
      type: Number,
      default: 0,
      min: 0,
    },
    hydrationRemindersActedOn: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const WorkSession = mongoose.model("WorkSession", WorkSessionSchema);

/**
 * Zod validation schema for WorkSession creation
 * Note: userId is optional (extracted from JWT), workDuration defaults to duration if not provided
 */
export const CreateWorkSessionSchema = z.object({
  userId: z.string().min(1, "User ID is required").optional(),
  sessionDate: z.coerce.date().optional(),
  duration: z
    .number()
    .min(1, "Session duration must be at least 1 minute"),
  workDuration: z
    .number()
    .min(1, "Work duration must be at least 1 minute")
    .optional(),
  breaksTaken: z.number().nonnegative().optional(),
  breaksScheduled: z.number().nonnegative().optional(),
  hydrationRemindersReceived: z.number().nonnegative().optional(),
  hydrationRemindersActedOn: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

/**
 * Zod validation schema for WorkSession updates
 */
export const UpdateWorkSessionSchema =
  CreateWorkSessionSchema.partial().omit({ userId: true });

/**
 * Calculate productivity score for a session
 * @param breaksTaken - Number of breaks taken
 * @param breaksScheduled - Number of breaks scheduled
 * @param hydrationActed - Hydration reminders acted on
 * @param hydrationReceived - Hydration reminders received
 * @returns Productivity score (0-100)
 */
export function calculateProductivityScore(
  breaksTaken: number,
  breaksScheduled: number,
  hydrationActed: number,
  hydrationReceived: number
): number {
  const breakCompletionRate =
    breaksScheduled > 0 ? (breaksTaken / breaksScheduled) * 100 : 100;
  const hydrationCompletionRate =
    hydrationReceived > 0 ? (hydrationActed / hydrationReceived) * 100 : 100;

  const score = (breakCompletionRate + hydrationCompletionRate) / 2;
  return Math.min(100, Math.max(0, Math.round(score)));
}
