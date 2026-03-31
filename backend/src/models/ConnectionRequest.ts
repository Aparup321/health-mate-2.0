import mongoose, { Schema, type Document } from "mongoose";
import { z } from "zod";

export interface IConnectionRequest extends Document {
  fromUserId: string;
  fromUserName: string;
  fromReferralCode: string;
  toUserId: string;
  toUserName: string;
  toReferralCode: string;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
  updatedAt: Date;
}

const ConnectionRequestSchema = new Schema<IConnectionRequest>(
  {
    fromUserId: {
      type: String,
      required: true,
      index: true,
    },
    fromUserName: {
      type: String,
      required: true,
    },
    fromReferralCode: {
      type: String,
      required: true,
    },
    toUserId: {
      type: String,
      required: true,
      index: true,
    },
    toUserName: {
      type: String,
      required: true,
    },
    toReferralCode: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

ConnectionRequestSchema.index({ toUserId: 1, status: 1 });
ConnectionRequestSchema.index({ fromUserId: 1, status: 1 });

export const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  ConnectionRequestSchema
);

export const SendConnectionRequestSchema = z.object({
  toUserId: z.string().min(1, "User ID is required"),
});

export const UpdateConnectionRequestSchema = z.object({
  status: z.enum(["accepted", "declined"]),
});
