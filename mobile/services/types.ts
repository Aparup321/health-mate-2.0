/**
 * API Types - All request/response types for the HealthMate API
 */

// ==================== Auth ====================
export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

// ==================== Health Profile ====================
export interface HealthProfile {
  id: string;
  userId: string;
  age: number;
  gender: "male" | "female" | "other";
  height: number;    // cm
  weight: number;    // kg
  isSmoker: boolean;
  exerciseFamiliarity: "beginner" | "intermediate" | "advanced";
  targetCalories?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHealthProfileRequest {
  userId: string;
  age: number;
  gender: "male" | "female" | "other";
  height: number;
  weight: number;
  isSmoker: boolean;
  exerciseFamiliarity: "beginner" | "intermediate" | "advanced";
}

export interface UpdateHealthProfileRequest {
  weight?: number;
  targetCalories?: number;
}

export interface BMIResponse {
  bmi: number;
  category: string;
  height: number;
  weight: number;
}

// ==================== Work Sessions ====================
export interface WorkSession {
  id: string;
  userId: string;
  duration: number;       // minutes
  workDuration: number;   // minutes
  breaksScheduled: number;
  breaksTaken: number;
  hydrationRemindersActedOn: number;
  status: "active" | "paused" | "completed";
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkSessionRequest {
  userId: string;
  duration: number;
  workDuration: number;
  breaksScheduled: number;
}

export interface UpdateWorkSessionRequest {
  breaksTaken?: number;
  hydrationRemindersActedOn?: number;
}

export interface WorkSessionListResponse {
  sessions: WorkSession[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// ==================== Activities ====================
export interface HydrationLog {
  _id: string;
  userId: string;
  amount: number;      // ml
  date: string;
  time?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogHydrationRequest {
  userId: string;
  amount: number;
  date: string;       // ISO date string (required by Zod)
  time?: string;
  notes?: string;
}

export interface HydrationListResponse {
  logs: HydrationLog[];
  total: number;
  page: number;
  limit: number;
}

export type ExerciseType =
  | "running"
  | "walking"
  | "cycling"
  | "gym"
  | "yoga"
  | "swimming"
  | "sports"
  | "other";

export interface ExerciseLog {
  _id: string;
  userId: string;
  exerciseType: ExerciseType;
  duration: number;       // minutes
  intensity: "low" | "medium" | "high";
  caloriesBurned?: number;
  date?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogExerciseRequest {
  userId: string;
  exerciseType: ExerciseType;
  duration: number;
  intensity: "low" | "medium" | "high";
  caloriesBurned?: number;
  date?: string;
  notes?: string;
}

export interface ExerciseListResponse {
  logs: ExerciseLog[];
  total: number;
  page: number;
  limit: number;
}

export type BreakType =
  | "stretching"
  | "breathing"
  | "walking"
  | "meditation"
  | "other";

export interface BreakLog {
  _id: string;
  userId: string;
  sessionId: string;
  breakType: BreakType;
  duration: number;     // seconds
  date?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogBreakRequest {
  userId: string;
  sessionId: string;
  breakType: BreakType;
  duration: number;     // seconds
  date?: string;
  notes?: string;
}

export interface BreakListResponse {
  logs: BreakLog[];
  total: number;
  page: number;
  limit: number;
}

export interface SmokingLog {
  _id: string;
  userId: string;
  cigarettesSmoked: number;
  cravingLevel: number;
  date: string;
  time?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogSmokingRequest {
  userId: string;
  cigarettesSmoked: number;
  cravingLevel: number;
  date: string;
  notes?: string;
}

// ==================== Gamification ====================
export interface PointsResponse {
  totalPoints: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface AchievementsResponse {
  count: number;
  achievements: Achievement[];
}

export interface Streak {
  id: string;
  type: string;
  count: number;
  lastDate: string;
}

export interface StreakResponse {
  count: number;
  streaks: Streak[];
}

// ==================== Leaderboard ====================
export interface LeaderboardEntry {
  _id: string;
  rank: number;
  userId: string;
  userName: string;
  avatar?: string;
  totalPoints: number;
  tier: string;
}

export interface LeaderboardPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  pagination: LeaderboardPagination;
}

// ==================== Peer Challenges ====================
export type ChallengeType = "hydration" | "exercise" | "breaks" | "smoke_free" | "overall";

export interface PeerChallenge {
  _id: string;
  groupId: string;
  groupName: string;
  creatorId: string;
  members: string[];
  challengeType: ChallengeType;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PeerChallengeListResponse {
  count: number;
  challenges: PeerChallenge[];
}

export interface PeerChallengeDetailsResponse {
  challenge: PeerChallenge;
  leaderboard: LocalLeaderboardEntry[];
}

export interface LocalLeaderboardEntry {
  _id: string;
  userId: string;
  groupId: string;
  userName: string;
  totalPoints: number;
  rank: number;
  sessionsCompleted: number;
  breaksTaken: number;
  exerciseCount: number;
}

export interface CreatePeerChallengeRequest {
  groupId: string;
  groupName: string;
  creatorId: string;
  members: string[];
  challengeType: ChallengeType;
  startDate: string;
  endDate: string;
}

export interface UpdatePeerChallengeRequest {
  members?: string[];
  groupName?: string;
  challengeType?: ChallengeType;
  startDate?: string;
  endDate?: string;
}

// ==================== Reminders ====================
export type ReminderType = "hydration" | "exercise" | "work_session" | "smoking_avoidance";

export interface ReminderSetting {
  type: ReminderType;
  enabled: boolean;
}

export interface ReminderScheduleResponse {
  reminders: ReminderSetting[];
}

export interface UpdateReminderRequest {
  reminderType: ReminderType;
  enabled: boolean;
}

export interface UpdateReminderResponse {
  reminderType: ReminderType;
  enabled: boolean;
}

export interface TestReminderResponse {
  type: ReminderType;
}

// ==================== API Response Wrapper ====================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedParams {
  page?: number;
  limit?: number;
}
