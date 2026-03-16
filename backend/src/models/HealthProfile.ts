import mongoose, { Schema, type Document } from "mongoose";
import { z } from "zod";

export interface IHealthProfile extends Document {
  userId: string;
  height: number;
  weight: number;
  gender: "male" | "female" | "other";
  age: number;
  bmi: number;
  isSmoker: boolean;
  smokingQuitDate?: Date;
  exerciseFamiliarity: "beginner" | "intermediate" | "advanced";
  targetCalories?: number;
  targetWaterIntake?: number;
  createdAt: Date;
  updatedAt: Date;
}

const HealthProfileSchema = new Schema<IHealthProfile>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    height: {
      type: Number,
      required: true,
      min: [50, "Height must be at least 50 cm"],
      max: [300, "Height must be at most 300 cm"],
    },
    weight: {
      type: Number,
      required: true,
      min: [20, "Weight must be at least 20 kg"],
      max: [500, "Weight must be at most 500 kg"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: [13, "User must be at least 13 years old"],
      max: [150, "Please enter a valid age"],
    },
    bmi: {
      type: Number,
      required: true,
    },
    isSmoker: {
      type: Boolean,
      default: false,
    },
    smokingQuitDate: {
      type: Date,
      default: null,
    },
    exerciseFamiliarity: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    targetCalories: {
      type: Number,
      default: 2000,
    },
    targetWaterIntake: {
      type: Number,
      default: 2000,
    },
  },
  { timestamps: true }
);

export const HealthProfile = mongoose.model(
  "HealthProfile",
  HealthProfileSchema
);

/**
 * Zod validation schema for HealthProfile creation
 * Note: userId is optional and will be injected from JWT token by controller
 */
export const CreateHealthProfileSchema = z.object({
  userId: z.string().min(1, "User ID is required").optional(),
  height: z
    .number()
    .min(50, "Height must be at least 50 cm")
    .max(300, "Height must be at most 300 cm"),
  weight: z
    .number()
    .min(20, "Weight must be at least 20 kg")
    .max(500, "Weight must be at most 500 kg"),
  gender: z.enum(["male", "female", "other"]),
  age: z
    .number()
    .min(13, "User must be at least 13 years old")
    .max(150, "Please enter a valid age"),
  isSmoker: z.boolean().default(false),
  exerciseFamiliarity: z
    .enum(["beginner", "intermediate", "advanced"])
    .default("beginner"),
  targetCalories: z.number().positive().optional(),
  targetWaterIntake: z.number().positive().optional(),
});

/**
 * Zod validation schema for HealthProfile updates
 */
export const UpdateHealthProfileSchema = CreateHealthProfileSchema.partial();

/**
 * Calculate BMI from height (cm) and weight (kg)
 * @param height - Height in centimeters
 * @param weight - Weight in kilograms
 * @returns BMI value
 */
export function calculateBMI(height: number, weight: number): number {
  const heightInMeters = height / 100;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(2));
}

/**
 * Get BMI category
 * @param bmi - BMI value
 * @returns BMI category
 */
export function getBMICategory(
  bmi: number
): "underweight" | "normal" | "overweight" | "obese" {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "normal";
  if (bmi < 30) return "overweight";
  return "obese";
}
