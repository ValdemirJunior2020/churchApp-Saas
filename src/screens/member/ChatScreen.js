// src/screens/member/ChatScreen.js

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/firebaseConfig";
import { colors, radius, typography } from "../../theme";

function formatTime(value) {
  if (!value) return "Now";
  const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "Now";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function ChatScreen() {
  const { tenant, profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!tenant?.churchId) {
      setLoading(false);
      return undefined;
    }

    const messagesRef = collection(db, "churches", tenant.churchId, "chatMessages");
    const q = query(messagesRef, orderBy("createdAt", "desc"), limit(100));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const next = snap.docs.map((item) => ({ messageId: item.id, ...item.data() }));
        setMessages(next);
        setLoading(false);
      },
      (error) => {
        console.error("chat snapshot error", error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [tenant?.churchId]);

  const title = useMemo(() => tenant?.churchName || "Church Chat", [tenant?.churchName]);

  async function sendMessage() {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!tenant?.churchId) {
      Alert.alert("Unavailable", "Join or create a church first.");
      return;
    }

    try {
      setSending(true);
      await addDoc(collection(db, "churches", tenant.churchId, "chatMessages"), {
        text: trimmed,
        churchId: tenant.churchId,
        senderId: profile?.uid || "",
        senderName: profile?.fullName || profile?.email || "Member",
        senderEmail: profile?.email || "",
        role: profile?.role || "MEMBER",
        createdAt: serverTimestamp(),
      });
      setText("");
      requestAnimationFrame(() => flatListRef.current?.scrollToOffset?.({ offset: 0, animated: true }));
    } catch (error) {
      Alert.alert("Error", error?.message || "Could not send message.");
    } finally {
      setSending(false);
    }
  }

  function renderItem({ item }) {
    const mine = item.senderId && item.senderId === profile?.uid;
    return (
      <View style={[styles.messageRow, mine ? styles.mineRow : styles.otherRow]}>
        <GlassCard style={[styles.messageCard, mine && styles.mineCard]}>
          <View style={styles.messageHeader}>
            <Text style={styles.sender}>{item.senderName || "Member"}</Text>
            <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
          </View>
          <Text style={styles.messageText}>{item.text || ""}</Text>
        </GlassCard>
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
            <Text style={styles.kicker}>PRO FEATURE</Text>
            <Text style={styles.title}>{title} Chat</Text>
            <Text style={styles.sub}>Members can pray, encourage, and stay connected together in real time.</Text>

            <GlassCard style={styles.listWrap}>
              {loading ? (
                <View style={styles.centerState}>
                  <ActivityIndicator color={colors.cyan} />
                  <Text style={styles.stateText}>Loading messages...</Text>
                </View>
              ) : messages.length === 0 ? (
                <View style={styles.centerState}>
                  <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.textMuted} />
                  <Text style={styles.stateTitle}>No messages yet</Text>
                  <Text style={styles.stateText}>Start the first conversation for your church family.</Text>
                </View>
              ) : (
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  keyExtractor={(item) => item.messageId}
                  renderItem={renderItem}
                  inverted
                  contentContainerStyle={styles.messagesContent}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </GlassCard>

            <View style={styles.composerWrap}>
              <TextInput
                style={styles.input}
                value={text}
                onChangeText={setText}
                placeholder="Write a message to your church family"
                placeholderTextColor={colors.textMuted}
                multiline
              />
              <Pressable style={[styles.sendBtn, sending && styles.sendBtnDisabled]} onPress={sendMessage} disabled={sending}>
                <Ionicons name={sending ? "hourglass-outline" : "send"} size={18} color="#fff" />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 100,
  },
  kicker: { ...typography.kicker },
  title: { ...typography.h2, marginTop: 8 },
  sub: { ...typography.body, marginTop: 8 },
  listWrap: {
    flex: 1,
    marginTop: 16,
    padding: 0,
    overflow: "hidden",
  },
  messagesContent: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  messageRow: { width: "100%" },
  mineRow: { alignItems: "flex-end" },
  otherRow: { alignItems: "flex-start" },
  messageCard: {
    maxWidth: "88%",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  mineCard: {
    borderColor: "rgba(34,211,238,0.30)",
    backgroundColor: "rgba(34,211,238,0.10)",
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sender: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
  time: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  messageText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    marginTop: 8,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    gap: 10,
  },
  stateTitle: {
    ...typography.h3,
    textAlign: "center",
  },
  stateText: {
    ...typography.body,
    textAlign: "center",
  },
  composerWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginTop: 14,
  },
  input: {
    flex: 1,
    minHeight: 54,
    maxHeight: 140,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: "rgba(255,255,255,0.07)",
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 14,
    textAlignVertical: "top",
  },
  sendBtn: {
    width: 54,
    height: 54,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.violet,
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
});
