import { type Request, type Response } from "express";
import { PeerChallenge, LocalLeaderboard } from "../models/Leaderboard";
import { User } from "../models/User";
import { sendSuccessResponse } from "../utils/errorHandler";
import { asyncHandler } from "../utils/errorHandler";

class PeerChallengeController {
  /**
   * Create new peer challenge
   * POST /api/v1/peer-challenges
   */
  createChallenge = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { groupId, groupName, members, challengeType, startDate, endDate } =
        req.validatedBody || req.body;

      // Ensure creator is in members
      if (!members.includes(userId)) {
        members.push(userId);
      }

      const challenge = new PeerChallenge({
        groupId,
        groupName,
        creatorId: userId,
        members,
        challengeType,
        startDate,
        endDate,
        isActive: true,
      });

      await challenge.save();

      // Create local leaderboard entries for all members
      for (const memberId of members) {
        const user = await User.findOne({ clerkId: memberId });
        const existing = await LocalLeaderboard.findOne({
          userId: memberId,
          groupId,
        });

        if (!existing && user) {
          const entry = new LocalLeaderboard({
            userId: memberId,
            groupId,
            userName: user.name,
            totalPoints: 0,
            rank: 0,
          });

          await entry.save();
        }
      }

      sendSuccessResponse(res, 201, challenge, "Challenge created successfully");
    }
  );

  /**
   * Get user's challenges
   * GET /api/v1/peer-challenges
   */
  getUserChallenges = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;

      const challenges = await PeerChallenge.find({
        members: userId,
      }).exec();

      sendSuccessResponse(
        res,
        200,
        {
          count: challenges.length,
          challenges,
        },
        "User challenges retrieved"
      );
    }
  );

  /**
   * Get challenge details
   * GET /api/v1/peer-challenges/:id
   */
  getChallengeDetails = asyncHandler(
    async (req: Request, res: Response) => {
      const { id } = req.params;

      const challenge = await PeerChallenge.findById(id);

      if (!challenge) {
        return res.status(404).json({
          success: false,
          error: { message: "Challenge not found" },
        });
      }

      // Get leaderboard for this challenge
      const leaderboard = await LocalLeaderboard.find({
        groupId: challenge.groupId,
      })
        .sort({ totalPoints: -1 })
        .exec();

      sendSuccessResponse(
        res,
        200,
        {
          challenge,
          leaderboard,
        },
        "Challenge details retrieved"
      );
    }
  );

  /**
   * Update challenge
   * PUT /api/v1/peer-challenges/:id
   */
  updateChallenge = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { id } = req.params;
      const updates = req.validatedBody || req.body;

      const challenge = await PeerChallenge.findById(id);

      if (!challenge) {
        return res.status(404).json({
          success: false,
          error: { message: "Challenge not found" },
        });
      }

      // Only creator can update
      if (challenge.creatorId !== userId) {
        return res.status(403).json({
          success: false,
          error: { message: "Only creator can update this challenge" },
        });
      }

      Object.assign(challenge, updates);
      await challenge.save();

      sendSuccessResponse(res, 200, challenge, "Challenge updated");
    }
  );

  /**
   * Join challenge
   * POST /api/v1/peer-challenges/:id/join
   */
  joinChallenge = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { id } = req.params;

      const challenge = await PeerChallenge.findById(id);

      if (!challenge) {
        return res.status(404).json({
          success: false,
          error: { message: "Challenge not found" },
        });
      }

      if (challenge.members.includes(userId)) {
        return res.status(409).json({
          success: false,
          error: { message: "Already a member of this challenge" },
        });
      }

      challenge.members.push(userId);
      await challenge.save();

      // Create local leaderboard entry
      const user = await User.findOne({ clerkId: userId });
      const entry = new LocalLeaderboard({
        userId,
        groupId: challenge.groupId,
        userName: user?.name || "User",
        totalPoints: 0,
        rank: 0,
      });

      await entry.save();

      sendSuccessResponse(res, 200, challenge, "Joined challenge successfully");
    }
  );

  /**
   * Leave challenge
   * POST /api/v1/peer-challenges/:id/leave
   */
  leaveChallenge = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { id } = req.params;

      const challenge = await PeerChallenge.findById(id);

      if (!challenge) {
        return res.status(404).json({
          success: false,
          error: { message: "Challenge not found" },
        });
      }

      if (!challenge.members.includes(userId)) {
        return res.status(404).json({
          success: false,
          error: { message: "Not a member of this challenge" },
        });
      }

      // Don't allow creator to leave
      if (challenge.creatorId === userId) {
        return res.status(403).json({
          success: false,
          error: { message: "Creator cannot leave the challenge" },
        });
      }

      challenge.members = challenge.members.filter((m) => m !== userId);
      await challenge.save();

      // Remove from local leaderboard
      await LocalLeaderboard.deleteOne({
        userId,
        groupId: challenge.groupId,
      });

      sendSuccessResponse(res, 200, {}, "Left challenge successfully");
    }
  );
}

export default new PeerChallengeController();
