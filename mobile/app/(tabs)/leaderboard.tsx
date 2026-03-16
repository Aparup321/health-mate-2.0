/**
 * Leaderboard & Peer Challenges tab
 * Two top-level sections: Leaderboard (Global/Bronze/Silver/Gold)
 * and Challenges (create/view peer challenges)
 */
import { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { leaderboardApi, peerChallengesApi } from "@/services/api";
import { ApiError } from "@/services/api";
import { useAuth } from "@/services/auth";
import type {
  LeaderboardEntry,
  PeerChallenge,
  ChallengeType,
  LocalLeaderboardEntry,
} from "@/services/types";
import Card from "@/components/Card";
import Button from "@/components/Button";

type TopSection = "leaderboard" | "challenges";
type LeaderboardTab = "global" | "bronze" | "silver" | "gold";

const challengeTypeConfig: Record<
  ChallengeType,
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  hydration: { label: "Hydration", icon: "water", color: "#3B82F6" },
  exercise: { label: "Exercise", icon: "barbell", color: "#10B981" },
  breaks: { label: "Breaks", icon: "cafe", color: "#F59E0B" },
  smoke_free: { label: "Smoke Free", icon: "ban", color: "#EF4444" },
  overall: { label: "Overall", icon: "trophy", color: "#A78BFA" },
};

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [section, setSection] = useState<TopSection>("leaderboard");

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={["top"]}>
      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <Text className="text-white text-2xl font-bold">Ranks</Text>
        <Text className="text-slate-400 text-sm mt-1">
          Compete and challenge your peers
        </Text>
      </View>

      {/* Top section toggle */}
      <View className="flex-row mx-5 mb-4 bg-slate-800 rounded-xl p-1">
        <TouchableOpacity
          className={`flex-1 items-center py-2.5 rounded-lg ${
            section === "leaderboard" ? "bg-emerald-500" : ""
          }`}
          onPress={() => setSection("leaderboard")}
        >
          <Text
            className={`text-sm font-semibold ${
              section === "leaderboard" ? "text-slate-900" : "text-slate-400"
            }`}
          >
            Leaderboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 items-center py-2.5 rounded-lg ${
            section === "challenges" ? "bg-emerald-500" : ""
          }`}
          onPress={() => setSection("challenges")}
        >
          <Text
            className={`text-sm font-semibold ${
              section === "challenges" ? "text-slate-900" : "text-slate-400"
            }`}
          >
            Challenges
          </Text>
        </TouchableOpacity>
      </View>

      {section === "leaderboard" ? (
        <LeaderboardSection />
      ) : (
        <ChallengesSection userId={user?.id || ""} userName={user?.name || ""} />
      )}
    </SafeAreaView>
  );
}

// ==================== Leaderboard Section ====================
function LeaderboardSection() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("global");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [activeTab])
  );

  async function fetchData() {
    setIsLoading(true);
    try {
      let res;
      if (activeTab === "global") {
        res = await leaderboardApi.getGlobal({ limit: 50 });
      } else {
        res = await leaderboardApi.getByTier(activeTab, { limit: 50 });
      }
      setEntries(res.data.leaderboard || []);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }

  const tierColors: Record<string, string> = {
    bronze: "#CD7F32",
    silver: "#C0C0C0",
    gold: "#FFD700",
  };

  function getRankIcon(
    rank: number
  ): { name: keyof typeof Ionicons.glyphMap; color: string } | null {
    if (rank === 1) return { name: "trophy", color: "#FFD700" };
    if (rank === 2) return { name: "trophy", color: "#C0C0C0" };
    if (rank === 3) return { name: "trophy", color: "#CD7F32" };
    return null;
  }

  return (
    <>
      {/* Tier tabs */}
      <View className="flex-row mx-5 mb-4 bg-slate-800/60 rounded-xl p-1">
        {(
          [
            { id: "global", label: "Global" },
            { id: "bronze", label: "Bronze" },
            { id: "silver", label: "Silver" },
            { id: "gold", label: "Gold" },
          ] as const
        ).map((tab) => (
          <TouchableOpacity
            key={tab.id}
            className={`flex-1 items-center py-2 rounded-lg ${
              activeTab === tab.id ? "bg-slate-700" : ""
            }`}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              className={`text-xs font-semibold ${
                activeTab === tab.id ? "text-white" : "text-slate-500"
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : entries.length === 0 ? (
        <View className="flex-1 items-center justify-center px-5">
          <Ionicons name="trophy-outline" size={48} color="#334155" />
          <Text className="text-slate-500 text-base mt-4 text-center">
            No leaderboard data yet.{"\n"}Start earning XP to appear here!
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item._id || `${item.rank}-${item.userId}`}
          contentContainerClassName="px-5 pb-8"
          renderItem={({ item }) => {
            const rankIcon = getRankIcon(item.rank);
            return (
              <View className="flex-row items-center bg-slate-800 rounded-xl px-4 py-3 mb-2">
                <View className="w-10 items-center mr-3">
                  {rankIcon ? (
                    <Ionicons
                      name={rankIcon.name}
                      size={22}
                      color={rankIcon.color}
                    />
                  ) : (
                    <Text className="text-slate-400 text-base font-bold">
                      {item.rank}
                    </Text>
                  )}
                </View>
                <View className="w-10 h-10 rounded-full bg-slate-700 items-center justify-center mr-3">
                  <Text className="text-slate-300 text-sm font-bold">
                    {(item.userName || "?").charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white text-base font-medium">
                    {item.userName}
                  </Text>
                  <Text
                    className="text-xs"
                    style={{
                      color:
                        tierColors[item.tier?.toLowerCase()] || "#94A3B8",
                    }}
                  >
                    {item.tier}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-white text-base font-bold">
                    {item.totalPoints.toLocaleString()}
                  </Text>
                  <Text className="text-slate-500 text-xs">pts</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </>
  );
}

// ==================== Challenges Section ====================
function ChallengesSection({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const [challenges, setChallenges] = useState<PeerChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [challengeDetails, setChallengeDetails] = useState<{
    challenge: PeerChallenge;
    leaderboard: LocalLeaderboardEntry[];
  } | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchChallenges();
    }, [])
  );

  async function fetchChallenges() {
    setIsLoading(true);
    try {
      const res = await peerChallengesApi.list();
      setChallenges(res.data.challenges || []);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }

  async function viewDetails(id: string) {
    setSelectedChallenge(id);
    setDetailsLoading(true);
    try {
      const res = await peerChallengesApi.get(id);
      setChallengeDetails(res.data);
    } catch {
      Alert.alert("Error", "Could not load challenge details.");
      setSelectedChallenge(null);
    } finally {
      setDetailsLoading(false);
    }
  }

  async function leaveChallenge(id: string) {
    Alert.alert("Leave Challenge", "Are you sure you want to leave this challenge?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          try {
            await peerChallengesApi.leave(id);
            setSelectedChallenge(null);
            setChallengeDetails(null);
            fetchChallenges();
          } catch (err) {
            const msg =
              err instanceof ApiError && err.status === 403
                ? "Creators cannot leave their own challenge."
                : "Could not leave challenge.";
            Alert.alert("Error", msg);
          }
        },
      },
    ]);
  }

  async function deleteChallenge(id: string) {
    Alert.alert(
      "Delete Challenge",
      "This will permanently delete the challenge for all members.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await peerChallengesApi.delete(id);
              setSelectedChallenge(null);
              setChallengeDetails(null);
              fetchChallenges();
            } catch {
              Alert.alert("Error", "Could not delete challenge.");
            }
          },
        },
      ]
    );
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function getDaysLeft(endDate: string): number {
    const now = new Date();
    const end = new Date(endDate);
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  // ----- Details Modal -----
  if (selectedChallenge) {
    return (
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8"
      >
        {/* Back button */}
        <TouchableOpacity
          className="flex-row items-center mb-4"
          onPress={() => {
            setSelectedChallenge(null);
            setChallengeDetails(null);
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#10B981" />
          <Text className="text-emerald-400 text-sm font-medium ml-1">
            Back to Challenges
          </Text>
        </TouchableOpacity>

        {detailsLoading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#10B981" />
          </View>
        ) : challengeDetails ? (
          <>
            {/* Challenge header card */}
            <Card variant="elevated" className="mb-4">
              <View className="flex-row items-center mb-3">
                <View
                  className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                  style={{
                    backgroundColor: `${
                      challengeTypeConfig[challengeDetails.challenge.challengeType]
                        ?.color || "#A78BFA"
                    }20`,
                  }}
                >
                  <Ionicons
                    name={
                      challengeTypeConfig[challengeDetails.challenge.challengeType]
                        ?.icon || "trophy"
                    }
                    size={24}
                    color={
                      challengeTypeConfig[challengeDetails.challenge.challengeType]
                        ?.color || "#A78BFA"
                    }
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg font-bold">
                    {challengeDetails.challenge.groupName}
                  </Text>
                  <Text className="text-slate-400 text-sm">
                    {challengeTypeConfig[challengeDetails.challenge.challengeType]
                      ?.label || challengeDetails.challenge.challengeType}{" "}
                    Challenge
                  </Text>
                </View>
                {challengeDetails.challenge.isActive && (
                  <View className="bg-emerald-500/20 px-3 py-1 rounded-full">
                    <Text className="text-emerald-400 text-xs font-semibold">
                      Active
                    </Text>
                  </View>
                )}
              </View>

              {/* Date info */}
              <View className="flex-row justify-between bg-slate-900/50 rounded-lg px-3 py-2">
                <View className="items-center flex-1">
                  <Text className="text-slate-500 text-xs">Starts</Text>
                  <Text className="text-white text-sm font-medium">
                    {formatDate(challengeDetails.challenge.startDate)}
                  </Text>
                </View>
                <View className="w-px bg-slate-700" />
                <View className="items-center flex-1">
                  <Text className="text-slate-500 text-xs">Ends</Text>
                  <Text className="text-white text-sm font-medium">
                    {formatDate(challengeDetails.challenge.endDate)}
                  </Text>
                </View>
                <View className="w-px bg-slate-700" />
                <View className="items-center flex-1">
                  <Text className="text-slate-500 text-xs">Days Left</Text>
                  <Text className="text-emerald-400 text-sm font-bold">
                    {getDaysLeft(challengeDetails.challenge.endDate)}
                  </Text>
                </View>
              </View>

              {/* Members count */}
              <View className="flex-row items-center mt-3">
                <Ionicons name="people" size={16} color="#94A3B8" />
                <Text className="text-slate-400 text-sm ml-1">
                  {challengeDetails.challenge.members.length} member
                  {challengeDetails.challenge.members.length !== 1 ? "s" : ""}
                </Text>
              </View>
            </Card>

            {/* Challenge leaderboard */}
            <Text className="text-white text-lg font-bold mb-3">
              Challenge Standings
            </Text>
            {challengeDetails.leaderboard.length === 0 ? (
              <Card className="mb-4">
                <View className="items-center py-4">
                  <Ionicons name="bar-chart-outline" size={32} color="#334155" />
                  <Text className="text-slate-500 text-sm mt-2">
                    No activity yet. Start earning points!
                  </Text>
                </View>
              </Card>
            ) : (
              challengeDetails.leaderboard.map((entry, index) => (
                <View
                  key={entry._id}
                  className={`flex-row items-center bg-slate-800 rounded-xl px-4 py-3 mb-2 ${
                    entry.userId === userId ? "border border-emerald-500/30" : ""
                  }`}
                >
                  <View className="w-8 items-center mr-3">
                    {index === 0 ? (
                      <Ionicons name="trophy" size={18} color="#FFD700" />
                    ) : (
                      <Text className="text-slate-400 text-sm font-bold">
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  <View className="w-9 h-9 rounded-full bg-slate-700 items-center justify-center mr-3">
                    <Text className="text-slate-300 text-xs font-bold">
                      {(entry.userName || "?").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-sm font-medium">
                      {entry.userName}
                      {entry.userId === userId ? " (You)" : ""}
                    </Text>
                    <View className="flex-row mt-0.5">
                      <Text className="text-slate-500 text-xs">
                        {entry.exerciseCount} exercises
                      </Text>
                      <Text className="text-slate-600 text-xs mx-1">|</Text>
                      <Text className="text-slate-500 text-xs">
                        {entry.breaksTaken} breaks
                      </Text>
                    </View>
                  </View>
                  <Text className="text-white text-base font-bold">
                    {entry.totalPoints}
                  </Text>
                </View>
              ))
            )}

            {/* Action buttons */}
            <View className="gap-3 mt-4">
              {challengeDetails.challenge.creatorId === userId ? (
                <Button
                  title="Delete Challenge"
                  variant="danger"
                  onPress={() => deleteChallenge(challengeDetails.challenge._id)}
                  icon={
                    <Ionicons name="trash-outline" size={18} color="#F8FAFC" />
                  }
                />
              ) : (
                <Button
                  title="Leave Challenge"
                  variant="outline"
                  onPress={() => leaveChallenge(challengeDetails.challenge._id)}
                  icon={
                    <Ionicons name="exit-outline" size={18} color="#10B981" />
                  }
                />
              )}
            </View>
          </>
        ) : null}
      </ScrollView>
    );
  }

  // ----- Create Modal -----
  if (showCreate) {
    return (
      <CreateChallengeForm
        userId={userId}
        onCreated={() => {
          setShowCreate(false);
          fetchChallenges();
        }}
        onCancel={() => setShowCreate(false)}
      />
    );
  }

  // ----- Challenge List -----
  return (
    <>
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : (
        <FlatList
          data={challenges}
          keyExtractor={(item) => item._id}
          contentContainerClassName="px-5 pb-8"
          ListHeaderComponent={
            <TouchableOpacity
              className="flex-row items-center justify-center bg-emerald-500/10 border border-dashed border-emerald-500/40 rounded-xl py-4 mb-4"
              onPress={() => setShowCreate(true)}
            >
              <Ionicons name="add-circle-outline" size={22} color="#10B981" />
              <Text className="text-emerald-400 text-sm font-semibold ml-2">
                Create New Challenge
              </Text>
            </TouchableOpacity>
          }
          ListEmptyComponent={
            <View className="items-center py-12">
              <Ionicons name="people-outline" size={48} color="#334155" />
              <Text className="text-slate-500 text-base mt-4 text-center">
                No challenges yet.{"\n"}Create one and invite your friends!
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const config = challengeTypeConfig[item.challengeType] || challengeTypeConfig.overall;
            const daysLeft = getDaysLeft(item.endDate);

            return (
              <TouchableOpacity
                className="bg-slate-800 rounded-xl px-4 py-3.5 mb-3"
                onPress={() => viewDetails(item._id)}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-11 h-11 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: `${config.color}20` }}
                  >
                    <Ionicons
                      name={config.icon}
                      size={22}
                      color={config.color}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-base font-semibold">
                      {item.groupName}
                    </Text>
                    <View className="flex-row items-center mt-0.5">
                      <Text className="text-slate-400 text-xs">
                        {config.label}
                      </Text>
                      <Text className="text-slate-600 text-xs mx-1.5">
                        &bull;
                      </Text>
                      <Ionicons name="people" size={12} color="#64748B" />
                      <Text className="text-slate-400 text-xs ml-0.5">
                        {item.members.length}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    {item.isActive ? (
                      <>
                        <Text className="text-emerald-400 text-sm font-bold">
                          {daysLeft}d
                        </Text>
                        <Text className="text-slate-500 text-xs">left</Text>
                      </>
                    ) : (
                      <View className="bg-slate-700 px-2.5 py-0.5 rounded-full">
                        <Text className="text-slate-400 text-xs">Ended</Text>
                      </View>
                    )}
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#475569"
                    style={{ marginLeft: 8 }}
                  />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </>
  );
}

// ==================== Create Challenge Form ====================
function CreateChallengeForm({
  userId,
  onCreated,
  onCancel,
}: {
  userId: string;
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [groupName, setGroupName] = useState("");
  const [challengeType, setChallengeType] = useState<ChallengeType>("exercise");
  const [memberIds, setMemberIds] = useState("");
  const [durationDays, setDurationDays] = useState("7");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate() {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a challenge name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const startDate = new Date().toISOString();
      const endDate = new Date(
        Date.now() + parseInt(durationDays || "7", 10) * 24 * 60 * 60 * 1000
      ).toISOString();

      // Parse member IDs (comma-separated)
      const members = memberIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      // Unique group ID
      const groupId = `challenge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      await peerChallengesApi.create({
        groupId,
        groupName: groupName.trim(),
        creatorId: userId,
        members: members.length > 0 ? members : [userId],
        challengeType,
        startDate,
        endDate,
      });

      onCreated();
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not create challenge.";
      Alert.alert("Error", msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-5 pb-8"
      keyboardShouldPersistTaps="handled"
    >
      {/* Back */}
      <TouchableOpacity
        className="flex-row items-center mb-4"
        onPress={onCancel}
      >
        <Ionicons name="arrow-back" size={20} color="#10B981" />
        <Text className="text-emerald-400 text-sm font-medium ml-1">
          Back
        </Text>
      </TouchableOpacity>

      <Text className="text-white text-xl font-bold mb-1">
        Create Challenge
      </Text>
      <Text className="text-slate-400 text-sm mb-5">
        Challenge your friends and earn points together
      </Text>

      {/* Challenge Name */}
      <Text className="text-slate-300 text-sm font-medium mb-2">
        Challenge Name
      </Text>
      <TextInput
        className="bg-slate-800 text-white rounded-xl px-4 py-3.5 text-base mb-4 border border-slate-700"
        placeholder="e.g., Wellness Warriors"
        placeholderTextColor="#64748B"
        value={groupName}
        onChangeText={setGroupName}
      />

      {/* Challenge Type */}
      <Text className="text-slate-300 text-sm font-medium mb-2">
        Challenge Type
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {(Object.entries(challengeTypeConfig) as [ChallengeType, typeof challengeTypeConfig.exercise][]).map(
          ([type, config]) => (
            <TouchableOpacity
              key={type}
              className={`flex-row items-center px-3.5 py-2.5 rounded-xl border ${
                challengeType === type
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-slate-700 bg-slate-800"
              }`}
              onPress={() => setChallengeType(type)}
            >
              <Ionicons
                name={config.icon}
                size={16}
                color={challengeType === type ? "#10B981" : config.color}
              />
              <Text
                className={`text-sm ml-1.5 font-medium ${
                  challengeType === type ? "text-emerald-400" : "text-slate-400"
                }`}
              >
                {config.label}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Duration */}
      <Text className="text-slate-300 text-sm font-medium mb-2">
        Duration (days)
      </Text>
      <View className="flex-row gap-2 mb-4">
        {["3", "7", "14", "30"].map((d) => (
          <TouchableOpacity
            key={d}
            className={`flex-1 items-center py-2.5 rounded-xl border ${
              durationDays === d
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-slate-700 bg-slate-800"
            }`}
            onPress={() => setDurationDays(d)}
          >
            <Text
              className={`text-sm font-semibold ${
                durationDays === d ? "text-emerald-400" : "text-slate-400"
              }`}
            >
              {d}d
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Member IDs */}
      <Text className="text-slate-300 text-sm font-medium mb-1">
        Invite Members
      </Text>
      <Text className="text-slate-500 text-xs mb-2">
        Enter user IDs separated by commas (you are added automatically)
      </Text>
      <TextInput
        className="bg-slate-800 text-white rounded-xl px-4 py-3.5 text-base mb-6 border border-slate-700"
        placeholder="user-id-1, user-id-2"
        placeholderTextColor="#64748B"
        value={memberIds}
        onChangeText={setMemberIds}
        autoCapitalize="none"
      />

      {/* Submit */}
      <Button
        title="Create Challenge"
        variant="primary"
        isLoading={isSubmitting}
        onPress={handleCreate}
        icon={<Ionicons name="rocket-outline" size={18} color="#0F172A" />}
      />
    </ScrollView>
  );
}
