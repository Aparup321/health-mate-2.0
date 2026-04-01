/**
 * Connection tab - Find and invite friends by User ID or username
 */
import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/services/auth";
import { authApi, connectionsApi } from "@/services/api";
import type { SearchUserResult, ConnectionRequest, Connection } from "@/services/types";
import Card from "@/components/Card";
import Button from "@/components/Button";

type ConnectionTab = "find" | "inbox" | "connections";

export default function ConnectionScreen() {
  const [activeTab, setActiveTab] = useState<ConnectionTab>("find");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={["top"]}>
      {/* Header */}
      <View className="pt-4 pb-3 px-5">
        <Text className="text-white text-2xl font-bold">Connect</Text>
        <Text className="text-slate-400 text-sm mt-1">
          Find friends and manage requests
        </Text>
      </View>

      {/* Tab selector */}
      <View className="flex-row mx-5 mb-4 bg-slate-800 rounded-xl p-1">
        {(
          [
            { id: "find", label: "Find", icon: "search-outline", iconActive: "search" },
            { id: "inbox", label: "Inbox", icon: "mail-outline", iconActive: "mail" },
            { id: "connections", label: "Friends", icon: "people-outline", iconActive: "people" },
          ] as const
        ).map((tab) => (
          <TouchableOpacity
            key={tab.id}
            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg ${
              activeTab === tab.id ? "bg-emerald-500" : ""
            }`}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={activeTab === tab.id ? tab.iconActive : tab.icon}
              size={16}
              color={activeTab === tab.id ? "#0F172A" : "#94A3B8"}
            />
            <Text
              className={`text-xs font-semibold ml-1 ${
                activeTab === tab.id ? "text-slate-900" : "text-slate-400"
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "find" && <FindFriendsTab refreshKey={refreshKey} setRefreshKey={setRefreshKey} />}
      {activeTab === "inbox" && <InboxTab refreshKey={refreshKey} setRefreshKey={setRefreshKey} />}
      {activeTab === "connections" && <ConnectionsListTab />}
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────
// FIND FRIENDS TAB
// ─────────────────────────────────────────────────────────
function FindFriendsTab({ refreshKey, setRefreshKey }: { refreshKey: number; setRefreshKey: (k: number) => void }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [connectedUsers, setConnectedUsers] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      fetchSentRequests();
      fetchConnections();
    }, [refreshKey])
  );

  async function fetchSentRequests() {
    try {
      const res = await connectionsApi.getSentRequests();
      const sentIds = new Set(res.data.requests.map((r) => r.toUserId));
      setSentRequests(sentIds);
    } catch {
      // ignore
    }
  }

  async function fetchConnections() {
    try {
      const res = await connectionsApi.getConnections();
      const connectedIds = new Set(res.data.connections.map((c) => c.userId));
      setConnectedUsers(connectedIds);
    } catch {
      // ignore
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
    setIsSearching(true);
    try {
      const res = await authApi.searchUsers(searchQuery.trim());
      setSearchResults(res.data.users || []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleInvite(userId: string, userName: string) {
    try {
      await connectionsApi.sendRequest(userId);
      setSentRequests((prev) => new Set(prev).add(userId));
      Alert.alert("Request Sent!", `You sent a connection request to ${userName}`);
      setRefreshKey(refreshKey + 1);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send request");
    }
  }

  const isConnectedOrSent = (userId: string) => connectedUsers.has(userId) || sentRequests.has(userId);

  return (
    <ScrollView contentContainerClassName="px-5 pb-8">
      {/* Your User ID card */}
      <Card variant="elevated" className="mb-5">
        <View className="flex-row items-center mb-3">
          <View className="w-10 h-10 rounded-xl items-center justify-center mr-3 bg-emerald-500/20">
            <Ionicons name="person-add" size={20} color="#10B981" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-base font-bold">Your User ID</Text>
            <Text className="text-slate-400 text-xs">Share to connect</Text>
          </View>
        </View>
        <View className="bg-slate-700/50 rounded-lg p-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-emerald-400 text-lg font-mono">
              {user?.referralCode || "Loading..."}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (user?.referralCode) {
                  Alert.alert("Copied!", "User ID copied");
                }
              }}
              className="bg-emerald-500/20 p-2 rounded-lg"
            >
              <Ionicons name="copy-outline" size={18} color="#10B981" />
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      {/* Search input */}
      <Text className="text-white text-base font-semibold mb-3">Find Friends</Text>
      <View className="flex-row gap-3 mb-6">
        <View className="flex-1 flex-row items-center bg-slate-800 rounded-xl px-4 border border-slate-700">
          <Ionicons name="search" size={18} color="#64748B" />
          <TextInput
            className="flex-1 text-white text-base py-3 ml-2"
            placeholder="User ID or username"
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(""); setSearchResults([]); }}>
              <Ionicons name="close-circle" size={18} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
        <Button title="Search" size="sm" onPress={handleSearch} isLoading={isSearching} disabled={!searchQuery.trim()} />
      </View>

      {/* Search results */}
      {searchResults.length > 0 && (
        <View className="mb-4">
          <Text className="text-slate-400 text-xs mb-2">Results</Text>
          {searchResults.map((result) => (
            <View key={result.id} className="flex-row items-center bg-slate-800 rounded-xl p-3 mb-2 border border-slate-700">
              <View className="w-10 h-10 rounded-full bg-emerald-500/20 items-center justify-center mr-3">
                <Text className="text-emerald-400 text-sm font-bold">{result.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white text-sm font-medium">{result.name}</Text>
                <Text className="text-slate-500 text-xs">ID: {result.referralCode}</Text>
              </View>
              {connectedUsers.has(result.id) ? (
                <View className="bg-emerald-500/20 px-3 py-1.5 rounded-lg">
                  <Text className="text-emerald-400 text-xs">Friend</Text>
                </View>
              ) : sentRequests.has(result.id) ? (
                <View className="bg-amber-500/20 px-3 py-1.5 rounded-lg">
                  <Text className="text-amber-400 text-xs">Sent</Text>
                </View>
              ) : (
                <TouchableOpacity className="bg-emerald-500 px-3 py-1.5 rounded-lg" onPress={() => handleInvite(result.id, result.name)}>
                  <Text className="text-slate-900 text-xs font-semibold">Invite</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

      {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
        <Text className="text-slate-500 text-sm text-center py-4">No users found</Text>
      )}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────
// INBOX TAB - Accept/Decline requests
// ─────────────────────────────────────────────────────────
function InboxTab({ refreshKey, setRefreshKey }: { refreshKey: number; setRefreshKey: (k: number) => void }) {
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [refreshKey])
  );

  async function fetchRequests() {
    setIsLoading(true);
    try {
      const res = await connectionsApi.getReceivedRequests();
      setRequests(res.data.requests || []);
    } catch {
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRespond(requestId: string, status: "accepted" | "declined") {
    setProcessingId(requestId);
    try {
      await connectionsApi.respondToRequest(requestId, status);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
      setRefreshKey(refreshKey + 1);
      Alert.alert(status === "accepted" ? "Accepted!" : "Declined", status === "accepted" ? "You are now connected!" : "Request declined");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to respond");
    } finally {
      setProcessingId(null);
    }
  }

  function formatTime(date: string) {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-slate-500">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerClassName="px-5 pb-8">
      {requests.length === 0 ? (
        <Card className="items-center py-8">
          <Ionicons name="mail-open-outline" size={48} color="#64748B" />
          <Text className="text-white text-base font-semibold mt-3">No Requests</Text>
          <Text className="text-slate-400 text-sm text-center mt-1">
            When someone sends you a connection request, it will appear here
          </Text>
        </Card>
      ) : (
        <>
          <Text className="text-white text-base font-semibold mb-3">
            {requests.length} Pending Request{requests.length !== 1 ? "s" : ""}
          </Text>
          {requests.map((req) => (
            <Card key={req._id} className="mb-3">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-emerald-500/20 items-center justify-center mr-3">
                  <Text className="text-emerald-400 text-lg font-bold">
                    {req.fromUserName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white text-base font-semibold">{req.fromUserName}</Text>
                  <Text className="text-slate-500 text-xs">ID: {req.fromReferralCode}</Text>
                  <Text className="text-slate-400 text-xs mt-1">{formatTime(req.createdAt)}</Text>
                </View>
              </View>
              <View className="flex-row gap-3 mt-4">
                <Button
                  title="Decline"
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onPress={() => handleRespond(req._id, "declined")}
                  isLoading={processingId === req._id}
                />
                <Button
                  title="Accept"
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onPress={() => handleRespond(req._id, "accepted")}
                  isLoading={processingId === req._id}
                />
              </View>
            </Card>
          ))}
        </>
      )}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────
// CONNECTIONS LIST TAB
// ─────────────────────────────────────────────────────────
function ConnectionsListTab() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchConnections();
    }, [])
  );

  async function fetchConnections() {
    setIsLoading(true);
    try {
      const res = await connectionsApi.getConnections();
      setConnections(res.data.connections || []);
    } catch {
      setConnections([]);
    } finally {
      setIsLoading(false);
    }
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleDateString([], { month: "short", day: "numeric" });
  }

  function handleRemovePress(conn: Connection) {
    Alert.alert(
      "Remove Friend",
      `Are you sure you want to remove ${conn.userName} from your friends?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeFriend(conn.id, conn.userName),
        },
      ]
    );
  }

  async function removeFriend(connectionId: string, userName: string) {
    setRemovingId(connectionId);
    try {
      await connectionsApi.removeConnection(connectionId);
      setConnections((prev) => prev.filter((c) => c.id !== connectionId));
      Alert.alert("Removed", `${userName} has been removed from your friends`);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to remove friend");
    } finally {
      setRemovingId(null);
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-slate-500">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerClassName="px-5 pb-8">
      {connections.length === 0 ? (
        <Card className="items-center py-8">
          <Ionicons name="people-outline" size={48} color="#64748B" />
          <Text className="text-white text-base font-semibold mt-3">No Friends Yet</Text>
          <Text className="text-slate-400 text-sm text-center mt-1">
            Find friends and accept their requests to see them here
          </Text>
        </Card>
      ) : (
        <>
          <Text className="text-white text-base font-semibold mb-3">
            {connections.length} Friend{connections.length !== 1 ? "s" : ""}
          </Text>
          {connections.map((conn) => (
            <View key={conn.id} className="bg-slate-800 rounded-xl p-4 mb-2 border border-slate-700">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-emerald-500/20 items-center justify-center mr-3">
                  <Text className="text-emerald-400 text-lg font-bold">
                    {conn.userName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white text-base font-semibold">{conn.userName}</Text>
                  <Text className="text-slate-500 text-xs">ID: {conn.referralCode}</Text>
                  <Text className="text-slate-400 text-xs">Connected {formatTime(conn.connectedAt)}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemovePress(conn)}
                  disabled={removingId === conn.id}
                  className="p-2"
                >
                  <Ionicons 
                    name="person-remove-outline" 
                    size={20} 
                    color={removingId === conn.id ? "#64748B" : "#EF4444"} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}
