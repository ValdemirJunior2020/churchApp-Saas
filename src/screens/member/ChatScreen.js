// File: src/screens/member/ChatScreen.js

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import ChurchBrandHeader from "../../components/ChurchBrandHeader";
import { useAuth } from "../../context/AuthContext";
import { useAppData } from "../../context/AppDataContext";
import { db } from "../../firebase/firebaseConfig";
import { colors, radius, typography } from "../../theme";

const TAB_BAR_SPACE = 112;

function formatTime(value) {
  try {
    if (!value) return "";
    const date =
      typeof value?.toDate === "function"
        ? value.toDate()
        : value instanceof Date
        ? value
        : new Date(value);

    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function ChatScreen() {
  const { tenant, profile } = useAuth();
  const { config } = useAppData();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const churchId = tenant?.churchId || "";

  const messagesRef = useMemo(() => {
    if (!churchId) return null;
    return collection(db, "churches", churchId, "chatMessages");
  }, [churchId]);

  useEffect(() => {
    if (!messagesRef) {
      setMessages([]);
      setLoading(false);
      return undefined;
    }

    console.log("[CHAT] subscribe:start", { churchId });
    setLoading(true);

    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        console.log("[CHAT] subscribe:success", { count: list.length });

        setMessages(list);
        setLoading(false);

        requestAnimationFrame(() => {
          flatListRef.current?.scrollToEnd?.({ animated: true });
        });
      },
      (error) => {
        console.log("[CHAT] subscribe:error", error);
        setLoading(false);
        Alert.alert(
          "Chat error",
          error?.message || "Could not load chat messages for this church."
        );
      }
    );

    return () => {
      console.log("[CHAT] subscribe:cleanup");
      unsub();
    };
  }, [messagesRef, churchId]);

  async function handleSend() {
    const cleanMessage = String(message || "").trim();

    console.log("[CHAT] send:pressed", {
      churchId,
      uid: profile?.uid || null,
      length: cleanMessage.length,
    });

    if (!cleanMessage || sending || !churchId || !profile?.uid) {
      console.log("[CHAT] send:blocked", {
        cleanMessage,
        sending,
        churchId,
        uid: profile?.uid || null,
      });
      return;
    }

    try {
      setSending(true);

      await addDoc(collection(db, "churches", churchId, "chatMessages"), {
        senderId: profile.uid,
        churchId,
        uid: profile.uid,
        fullName: profile.fullName || "Member",
        email: profile.email || "",
        text: cleanMessage,
        createdAt: serverTimestamp(),
      });

      console.log("[CHAT] send:success");

      setMessage("");
      Keyboard.dismiss();

      requestAnimationFrame(() => {
        flatListRef.current?.scrollToEnd?.({ animated: true });
      });
    } catch (error) {
      console.log("[CHAT] send:error", error);
      Alert.alert(
        "Message failed",
        error?.message || "Could not send message."
      );
    } finally {
      setSending(false);
    }
  }

  function renderEmpty() {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.cyan} />
          <Text style={styles.emptyTitle}>Loading church chat...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="chatbubble-ellipses-outline" size={34} color={colors.cyan} />
        <Text style={styles.emptyTitle}>No messages yet</Text>
        <Text style={styles.emptyText}>
          Start the first conversation for {config?.churchName || tenant?.churchName || "your church"}.
        </Text>
      </View>
    );
  }

  function renderItem({ item }) {
    const isMine =
      item?.senderId === profile?.uid || item?.uid === profile?.uid;

    return (
      <View style={[styles.messageRow, isMine && styles.messageRowMine]}>
        <View style={[styles.messageBubble, isMine && styles.messageBubbleMine]}>
          <View style={styles.messageMetaRow}>
            <Text style={styles.messageAuthor}>
              {isMine ? "You" : item?.fullName || "Member"}
            </Text>
            {!!formatTime(item?.createdAt) && (
              <Text style={styles.messageTime}>{formatTime(item?.createdAt)}</Text>
            )}
          </View>

          <Text style={styles.messageText}>{item?.text || ""}</Text>
        </View>
      </View>
    );
  }

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
        >
          <View style={styles.container}>
            <ChurchBrandHeader
              title={config?.churchName || tenant?.churchName || "Church Chat"}
              subtitle="Stay connected with your church family in real time."
              centered
              showChurchCode
            />

            <GlassCard style={styles.listCard}>
              <View style={styles.listHeader}>
                <View style={styles.listBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.listBadgeText}>CHURCH CHAT</Text>
                </View>

                <Text style={styles.countText}>
                  {messages.length} {messages.length === 1 ? "message" : "messages"}
                </Text>
              </View>

              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={[
                  styles.listContent,
                  messages.length === 0 && styles.listContentEmpty,
                ]}
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => {
                  flatListRef.current?.scrollToEnd?.({ animated: true });
                }}
              />
            </GlassCard>

            <GlassCard style={styles.inputCard}>
              <Text style={styles.inputLabel}>New Message</Text>

              <TextInput
                ref={inputRef}
                style={styles.input}
                value={message}
                onChangeText={(value) => {
                  console.log("[CHAT] input:onChange", { length: value.length });
                  setMessage(value);
                }}
                placeholder="Write a message to your church..."
                placeholderTextColor={colors.textMuted}
                multiline
                editable={!sending}
                autoCorrect
                autoCapitalize="sentences"
                returnKeyType="default"
                blurOnSubmit={false}
                onFocus={() => console.log("[CHAT] input:focus")}
                onBlur={() => console.log("[CHAT] input:blur")}
              />

              <View style={styles.actionRow}>
                <Pressable
                  style={styles.dismissButton}
                  onPress={() => {
                    console.log("[CHAT] hideKeyboard:pressed");
                    Keyboard.dismiss();
                  }}
                >
                  <Ionicons name="chevron-down-outline" size={18} color={colors.text} />
                  <Text style={styles.dismissButtonText}>Hide Keyboard</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.sendButton,
                    (sending || !message.trim()) && styles.sendButtonDisabled,
                  ]}
                  onPress={handleSend}
                  disabled={sending || !message.trim()}
                >
                  <Ionicons
                    name="send-outline"
                    size={18}
                    color={(sending || !message.trim()) ? colors.textSoft : "#041217"}
                  />
                  <Text
                    style={[
                      styles.sendButtonText,
                      (sending || !message.trim()) && styles.sendButtonTextDisabled,
                    ]}
                  >
                    {sending ? "Sending..." : "Send"}
                  </Text>
                </Pressable>
              </View>
            </GlassCard>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: TAB_BAR_SPACE,
    gap: 12,
  },
  listCard: {
    flex: 1,
    minHeight: 320,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  listBadge: {
    minHeight: 34,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: colors.stroke,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.success,
  },
  listBadgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  countText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  listContent: {
    paddingBottom: 8,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  messageRow: {
    marginBottom: 10,
    alignItems: "flex-start",
  },
  messageRowMine: {
    alignItems: "flex-end",
  },
  messageBubble: {
    maxWidth: "84%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: colors.stroke,
  },
  messageBubbleMine: {
    backgroundColor: "rgba(34,211,238,0.15)",
    borderColor: "rgba(34,211,238,0.35)",
  },
  messageMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 6,
  },
  messageAuthor: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  messageTime: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  messageText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 34,
    paddingHorizontal: 20,
    gap: 10,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyText: {
    ...typography.body,
    textAlign: "center",
  },
  inputCard: {
    marginBottom: 0,
  },
  inputLabel: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    minHeight: 92,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: "rgba(255,255,255,0.06)",
    color: colors.text,
    paddingHorizontal: 14,
    paddingTop: 14,
    textAlignVertical: "top",
    fontSize: 15,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 12,
  },
  dismissButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.strokeStrong,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  dismissButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  sendButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  sendButtonText: {
    color: "#041217",
    fontSize: 14,
    fontWeight: "900",
  },
  sendButtonTextDisabled: {
    color: colors.textSoft,
  },
});