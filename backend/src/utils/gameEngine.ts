import {
  Achievement,
  ACHIEVEMENT_DEFINITIONS,
  Streak,
} from "../models/Achievement";
import { GlobalLeaderboard, determineTier } from "../models/Leaderboard";
import {
  ACHIEVEMENTS_CONFIG,
  POINTS_CONFIG,
  TIER_THRESHOLDS,
} from "../config/constants";

/**
 * Game Engine - Handles all gamification logic
 */

/**
 * Award points to user and update leaderboard
 * @param userId - User ID
 * @param points - Points to award
 * @param source - Source of points (activity type)
 * @returns Updated leaderboard entry
 */
export async function awardPoints(
  userId: string,
  points: number,
  source: string,
): Promise<any> {
  try {
    let leaderboard = await GlobalLeaderboard.findOne({ userId });

    if (!leaderboard) {
      throw new Error("Leaderboard entry not found");
    }

    leaderboard.totalPoints += points;
    leaderboard.tier = determineTier(leaderboard.totalPoints);

    await leaderboard.save();
    return leaderboard;
  } catch (error) {
    console.error("Error awarding points:", error);
    throw error;
  }
}

/**
 * Check and award achievements
 * @param userId - User ID
 * @param trigger - Achievement trigger type
 * @param value - Current value for the trigger
 * @returns Array of newly unlocked achievements
 */
export async function checkAndAwardAchievements(
  userId: string,
  trigger: string,
  value: number = 0,
): Promise<any[]> {
  const unlockedAchievements = [];

  try {
    const achievementEntries = Object.entries(ACHIEVEMENTS_CONFIG);

    for (const [, achievement] of achievementEntries) {
      // Check if achievement matches trigger
      if (achievement.trigger !== trigger) continue;

      // Check if already unlocked
      const existing = await Achievement.findOne({
        userId,
        badgeType: achievement.id,
      });
      if (existing) continue;

      // Check if requirement is met
      if ("requirement" in achievement && value < achievement.requirement) {
        continue;
      }

      // Award achievement
      const newAchievement = new Achievement({
        userId,
        badgeType: achievement.id,
        title: achievement.title,
        description: achievement.description,
        points: achievement.points,
      });

      await newAchievement.save();

      // Award points
      await awardPoints(
        userId,
        achievement.points,
        `achievement_${achievement.id}`,
      );

      unlockedAchievements.push(newAchievement);
    }

    return unlockedAchievements;
  } catch (error) {
    console.error("Error checking achievements:", error);
    throw error;
  }
}

/**
 * Update or create streak
 * @param userId - User ID
 * @param streakType - Type of streak
 * @returns Updated streak document
 */
export async function updateStreak(
  userId: string,
  streakType: "work_sessions" | "hydration" | "exercise" | "smoke_free",
): Promise<any> {
  try {
    let streak = await Streak.findOne({ userId, streakType });

    if (!streak) {
      // Create new streak
      streak = new Streak({
        userId,
        streakType,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: new Date(),
      });
    } else {
      const lastActivity = streak.lastActivityDate;
      const today = new Date();
      const daysDiff = Math.floor(
        (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff === 1) {
        // Consecutive day
        streak.currentStreak += 1;
        if (streak.currentStreak > streak.longestStreak) {
          streak.longestStreak = streak.currentStreak;
        }
      } else if (daysDiff > 1) {
        // Streak broken
        streak.currentStreak = 1;
      }
      // If same day, don't increment

      streak.lastActivityDate = today;
    }

    await streak.save();

    // Check for streak achievements
    const streakAchievements = {
      work_sessions: "session_streak",
      hydration: "hydration_streak",
      exercise: "exercise_count",
      smoke_free: "smoke_free_streak",
    };

    const achievementTrigger = streakAchievements[streakType];
    if (achievementTrigger) {
      await checkAndAwardAchievements(
        userId,
        achievementTrigger,
        streak.currentStreak,
      );
    }

    return streak;
  } catch (error) {
    console.error("Error updating streak:", error);
    throw error;
  }
}

/**
 * Calculate leaderboard rankings
 * @param limit - Number of top users to return
 * @returns Top users sorted by points
 */
export async function getGlobalLeaderboardRankings(
  limit: number = 100,
): Promise<any[]> {
  try {
    const leaderboard = await GlobalLeaderboard.find()
      .sort({ totalPoints: -1 })
      .limit(limit)
      .exec();

    // Update ranks
    for (let i = 0; i < leaderboard.length; i++) {
      const entry = leaderboard[i];
      if (!entry) continue;
      entry.rank = i + 1;
      await entry.save();
    }

    return leaderboard;
  } catch (error) {
    console.error("Error getting leaderboard rankings:", error);
    throw error;
  }
}

/**
 * Get leaderboard by tier
 * @param tier - Tier name
 * @param limit - Number of results
 * @returns Users in specified tier
 */
export async function getLeaderboardByTier(
  tier: "bronze" | "silver" | "gold" | "platinum",
  limit: number = 50,
): Promise<any[]> {
  try {
    return await GlobalLeaderboard.find({ tier })
      .sort({ totalPoints: -1 })
      .limit(limit)
      .exec();
  } catch (error) {
    console.error("Error getting tier leaderboard:", error);
    throw error;
  }
}

/**
 * Get user's position in global leaderboard
 * @param userId - User ID
 * @returns User's rank and statistics
 */
export async function getUserLeaderboardPosition(userId: string): Promise<any> {
  try {
    const user = await GlobalLeaderboard.findOne({ userId });

    if (!user) {
      throw new Error("User not found in leaderboard");
    }

    // Count how many users have more points
    const usersAbove = await GlobalLeaderboard.countDocuments({
      totalPoints: { $gt: user.totalPoints },
    });

    return {
      userId,
      rank: usersAbove + 1,
      totalPoints: user.totalPoints,
      tier: user.tier,
      sessionsCompleted: user.sessionsCompleted,
      breaksTaken: user.breaksTaken,
      exerciseCount: user.exerciseCount,
    };
  } catch (error) {
    console.error("Error getting user position:", error);
    throw error;
  }
}

/**
 * Check if user qualifies for perfect week achievement
 * @param userId - User ID
 * @returns Boolean indicating if perfect week achieved
 */
export async function checkPerfectWeek(userId: string): Promise<boolean> {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Check if user met all daily goals for 7 days
    // This would need proper implementation based on actual daily goal tracking
    // For now, returning true as placeholder
    return true;
  } catch (error) {
    console.error("Error checking perfect week:", error);
    throw error;
  }
}

/**
 * Get user's achievements
 * @param userId - User ID
 * @returns Array of user's achievements
 */
export async function getUserAchievements(userId: string): Promise<any[]> {
  try {
    return await Achievement.find({ userId }).sort({ unlockedAt: -1 }).exec();
  } catch (error) {
    console.error("Error getting achievements:", error);
    throw error;
  }
}

/**
 * Get available achievements (not yet unlocked)
 * @param userId - User ID
 * @returns Array of available achievements
 */
export async function getAvailableAchievements(userId: string): Promise<any[]> {
  try {
    const unlocked = await Achievement.find({ userId }).select("badgeType");
    const unlockedIds = unlocked.map((a) => a.badgeType);

    const available = Object.values(ACHIEVEMENTS_CONFIG).filter(
      (achievement) => !unlockedIds.includes(achievement.id),
    );

    return available;
  } catch (error) {
    console.error("Error getting available achievements:", error);
    throw error;
  }
}

/**
 * Get user's total points
 * @param userId - User ID
 * @returns Total points
 */
export async function getUserTotalPoints(userId: string): Promise<number> {
  try {
    const leaderboard = await GlobalLeaderboard.findOne({ userId });
    return leaderboard?.totalPoints || 0;
  } catch (error) {
    console.error("Error getting user points:", error);
    throw error;
  }
}

/**
 * Get user's all streaks
 * @param userId - User ID
 * @returns Array of user's streaks
 */
export async function getUserStreaks(userId: string): Promise<Array<any>> {
  try {
    return await Streak.find({ userId }).exec();
  } catch (error) {
    console.error("Error getting streaks:", error);
    throw error;
  }
}

/**
 * Calculate exercise points based on intensity
 * @param intensity - Exercise intensity level
 * @returns Points to award
 */
export function calculateExercisePoints(
  intensity: "low" | "medium" | "high",
): number {
  switch (intensity) {
    case "low":
      return POINTS_CONFIG.EXERCISE_LOW;
    case "medium":
      return POINTS_CONFIG.EXERCISE_MEDIUM;
    case "high":
      return POINTS_CONFIG.EXERCISE_HIGH;
    default:
      return POINTS_CONFIG.EXERCISE_LOW;
  }
}

/**
 * Check and award streak bonus
 * @param userId - User ID
 * @param streakLength - Current streak length
 * @returns Points awarded
 */
export function getStreakBonus(streakLength: number): number {
  if (streakLength >= 30) return POINTS_CONFIG.STREAK_30_DAY;
  if (streakLength >= 14) return POINTS_CONFIG.STREAK_14_DAY;
  if (streakLength >= 7) return POINTS_CONFIG.STREAK_7_DAY;
  if (streakLength >= 3) return POINTS_CONFIG.STREAK_3_DAY;
  return 0;
}
