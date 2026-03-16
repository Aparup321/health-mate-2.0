import schedule from "node-schedule";
import { REMINDER_CONFIG } from "../config/constants";

/**
 * Reminder Engine - Handles scheduling and sending reminders
 */

interface UserReminder {
  userId: string;
  type: "work_session" | "hydration" | "exercise" | "smoking_avoidance";
  enabled: boolean;
  lastSentAt?: Date;
  nextScheduledFor?: Date;
}

// Store active reminders in memory (in production, use Redis)
const activeReminders = new Map<string, schedule.Job[]>();

/**
 * Schedule work session reminders
 * Sends reminder every 25 minutes during active session
 * @param userId - User ID
 * @param sessionId - Work session ID
 * @returns Scheduled job
 */
export function scheduleWorkSessionReminders(
  userId: string,
  sessionId: string,
): schedule.Job {
  const job = schedule.scheduleJob(`*/25 * * * *`, () => {
    sendReminder({
      userId,
      type: "work_session",
      message: REMINDER_CONFIG.WORK_SESSION.message,
    });
  });

  const key = `${userId}-work-session`;
  if (!activeReminders.has(key)) {
    activeReminders.set(key, []);
  }
  activeReminders.get(key)?.push(job);

  return job;
}

/**
 * Schedule hydration reminders
 * Sends reminder every 2 hours between 9 AM and 9 PM
 * @param userId - User ID
 * @returns Scheduled jobs
 */
export function scheduleHydrationReminders(userId: string): schedule.Job[] {
  const jobs: schedule.Job[] = [];
  const startHour = REMINDER_CONFIG.HYDRATION.startHour;
  const endHour = REMINDER_CONFIG.HYDRATION.endHour;
  const intervalMinutes = REMINDER_CONFIG.HYDRATION.intervalMinutes;

  for (
    let hour = startHour;
    hour < endHour;
    hour += Math.floor(intervalMinutes / 60)
  ) {
    const minute = (hour % 1) * 60;
    const cronExpression = `0 ${hour} * * *`;

    const job = schedule.scheduleJob(cronExpression, () => {
      const messageIndex = Math.floor(
        Math.random() * REMINDER_CONFIG.HYDRATION.messages.length,
      );
      const message =
        REMINDER_CONFIG.HYDRATION.messages[messageIndex] ||
        REMINDER_CONFIG.HYDRATION.messages[0] ||
        "Remember to drink water";
      sendReminder({
        userId,
        type: "hydration",
        message,
      });
    });

    jobs.push(job);
  }

  const key = `${userId}-hydration`;
  activeReminders.set(key, jobs);

  return jobs;
}

/**
 * Schedule exercise reminders
 * Sends reminder daily at 6 PM
 * @param userId - User ID
 * @returns Scheduled job
 */
export function scheduleExerciseReminders(userId: string): schedule.Job {
  const hour = REMINDER_CONFIG.EXERCISE.scheduleHour;
  const minute = REMINDER_CONFIG.EXERCISE.scheduleMinute;
  const cronExpression = `${minute} ${hour} * * *`;

  const job = schedule.scheduleJob(cronExpression, () => {
    sendReminder({
      userId,
      type: "exercise",
      message: REMINDER_CONFIG.EXERCISE.message,
    });
  });

  const key = `${userId}-exercise`;
  if (!activeReminders.has(key)) {
    activeReminders.set(key, []);
  }
  activeReminders.get(key)?.push(job);

  return job;
}

/**
 * Schedule smoking avoidance reminders
 * Sends reminders at 9 AM, 2 PM, and 8 PM
 * @param userId - User ID
 * @returns Scheduled jobs
 */
export function scheduleSmokingReminders(userId: string): schedule.Job[] {
  const jobs: schedule.Job[] = [];
  const times = REMINDER_CONFIG.SMOKING_AVOIDANCE.times;

  times.forEach((hour, index) => {
    const cronExpression = `0 ${hour} * * *`;

    const job = schedule.scheduleJob(cronExpression, () => {
      const message =
        REMINDER_CONFIG.SMOKING_AVOIDANCE.messages[index] ||
        REMINDER_CONFIG.SMOKING_AVOIDANCE.messages[0] ||
        "Stay strong today";
      sendReminder({
        userId,
        type: "smoking_avoidance",
        message,
      });
    });

    jobs.push(job);
  });

  const key = `${userId}-smoking`;
  activeReminders.set(key, jobs);

  return jobs;
}

/**
 * Send reminder to user
 * In production, this would send email, push notification, or store in DB
 * @param reminder - Reminder details
 */
export async function sendReminder(reminder: {
  userId: string;
  type: "work_session" | "hydration" | "exercise" | "smoking_avoidance";
  message: string;
}): Promise<void> {
  try {
    console.log(
      `[REMINDER] ${reminder.type.toUpperCase()} to user ${reminder.userId}: ${reminder.message}`,
    );

    // In production, implement:
    // 1. Send push notification via mobile service
    // 2. Send email via nodemailer
    // 3. Store in notifications database
    // 4. Track reminder sent for analytics

    // For now, just log
  } catch (error) {
    console.error("Error sending reminder:", error);
  }
}

/**
 * Cancel all reminders for a user
 * @param userId - User ID
 */
export function cancelUserReminders(userId: string): void {
  const keys = Array.from(activeReminders.keys()).filter((key) =>
    key.startsWith(userId),
  );

  keys.forEach((key) => {
    const jobs = activeReminders.get(key);
    if (jobs) {
      jobs.forEach((job) => job.cancel());
      activeReminders.delete(key);
    }
  });

  console.log(`Cancelled all reminders for user ${userId}`);
}

/**
 * Setup all reminders for a user
 * @param userId - User ID
 * @param isSmoker - Whether user is a smoker
 */
export function setupUserReminders(userId: string, isSmoker: boolean): void {
  if (REMINDER_CONFIG.HYDRATION.enabled) {
    scheduleHydrationReminders(userId);
  }

  if (REMINDER_CONFIG.EXERCISE.enabled) {
    scheduleExerciseReminders(userId);
  }

  if (REMINDER_CONFIG.SMOKING_AVOIDANCE.enabled && isSmoker) {
    scheduleSmokingReminders(userId);
  }

  console.log(`Set up reminders for user ${userId}`);
}

/**
 * Get active reminders for a user
 * @param userId - User ID
 * @returns Array of active reminder types
 */
export function getUserActiveReminders(userId: string): string[] {
  const active: string[] = [];
  const keys = Array.from(activeReminders.keys()).filter((key) =>
    key.startsWith(userId),
  );

  keys.forEach((key) => {
    const type = key.split("-").slice(1).join("-");
    active.push(type);
  });

  return active;
}

/**
 * Update reminder preferences
 * @param userId - User ID
 * @param reminderType - Type of reminder
 * @param enabled - Enable or disable
 */
export function updateReminderPreference(
  userId: string,
  reminderType: "work_session" | "hydration" | "exercise" | "smoking_avoidance",
  enabled: boolean,
): void {
  const key = `${userId}-${reminderType}`;

  if (enabled) {
    // Schedule if not already scheduled
    if (!activeReminders.has(key)) {
      console.log(`Enabling ${reminderType} reminders for user ${userId}`);
      // Add scheduling logic here
    }
  } else {
    // Cancel if scheduled
    const jobs = activeReminders.get(key);
    if (jobs) {
      jobs.forEach((job) => job.cancel());
      activeReminders.delete(key);
      console.log(`Disabled ${reminderType} reminders for user ${userId}`);
    }
  }
}

/**
 * Send test reminder
 * @param userId - User ID
 * @param reminderType - Type of reminder to test
 */
export async function sendTestReminder(
  userId: string,
  reminderType: "work_session" | "hydration" | "exercise" | "smoking_avoidance",
): Promise<void> {
  const messages: Record<string, string> = {
    work_session: REMINDER_CONFIG.WORK_SESSION.message,
    hydration:
      REMINDER_CONFIG.HYDRATION.messages[0] || "Remember to drink water",
    exercise: REMINDER_CONFIG.EXERCISE.message,
    smoking_avoidance:
      REMINDER_CONFIG.SMOKING_AVOIDANCE.messages[0] || "Stay strong today",
  };

  await sendReminder({
    userId,
    type: reminderType,
    message: `[TEST] ${messages[reminderType]}`,
  });
}
