// File: src/screens/member/ChatScreen.js

import React, { useEffect, useMemo, useState } from "react";
import {
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
  TouchableWithoutFeedback,
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
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/firebaseConfig";
import { colors, radius, typography } from "../../theme";

const TAB_BAR_SPACE = 110;

export default function ChatScreen() {
  const { tenant, profile } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);

  const churchId = tenant?.churchId;

  const messagesRef = useMemo(() => {
    if (!churchId) return null;
    return collection(db, "churches", churchId, "chatMessages");
  }, [churchId]);

  useEffect(() => {
    if (!messagesRef) return;

    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));
        setMessages(list);
      },
      (error) => {
        console.log("chat snapshot error", error);
      }
    );

    return unsub;
  }, [messagesRef]);

  async function handleSend() {
    const cleanMessage = String(message || "").trim();

    if (!cleanMessage || sending || !churchId || !profile?.uid) return;

    try {
      setSending(true);

      await addDoc(collection(db, "churches", churchId, "chatMessages"), {
        uid: profile.uid,
        fullName: profile.fullName || "Member",
        email: profile.email || "",
        text: cleanMessage,
        createdAt: serverTimestamp(),
      });

      setMessage("");
      Keyboard.dismiss();
    } catch (error) {
      console.log("chat send error", error);
      Alert.alert("Error", error?.message || "Could not send message.");
    } finally {
      setSending(false);
    }
  }

  function renderItem({ item }) {
    const isMine = item.uid === profile?.uid;

    return (
      <View style={[styles.messageRow, isMine && styles.messageRowMine]}>
        <View style={[styles.messageBubble, isMine && styles.messageBubbleMine]}>
          <Text style={styles.messageAuthor}>{item.fullName || "Member"}</Text>
          <Text style={styles.messageText}>{item.text || ""}</Text>
        </View>
      </View>
    );
  }

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
          >
            <View style={styles.container}>
              <GlassCard style={styles.headerCard}>
                <Text style={styles.title}>Church Chat</Text>
                <Text style={styles.sub}>Stay connected with your church family.</Text>
              </GlassCard>

              <GlassCard style={styles.listCard}>
                <FlatList
                  data={messages}
                  keyExtractor={(item) => item.id}
                  renderItem={renderItem}
                  contentContainerStyle={styles.listContent}
                  keyboardShouldPersistTaps="handled"
                />
              </GlassCard>

              <GlassCard style={styles.inputCard}>
                <TextInput
                  style={styles.input}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Write a message..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  returnKeyType="default"
                  blurOnSubmit={false}
                />

                <View style={styles.actionRow}>
                  <Pressable style={styles.dismissButton} onPress={Keyboard.dismiss}>
                    <Text style={styles.dismissButtonText}>Hide Keyboard</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.sendButton, sending && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={sending}
                  >
                    <Text style={styles.sendButtonText}>
                      {sending ? "Sending..." : "Send"}
                    </Text>
                  </Pressable>
                </View>
              </GlassCard>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
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
  headerCard: {},
  title: {
    ...typography.h2,
  },
  sub: {
    ...typography.body,
    marginTop: 8,
  },
  listCard: {
    flex: 1,
    minHeight: 280,
  },
  listContent: {
    paddingBottom: 8,
  },
  messageRow: {
    marginBottom: 10,
    alignItems: "flex-start",
  },
  messageRowMine: {
    alignItems: "flex-end",
  },
  messageBubble: {
    maxWidth: "82%",
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
  messageAuthor: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
  },
  messageText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  inputCard: {
    marginBottom: 0,
  },
  input: {
    minHeight: 84,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: "rgba(255,255,255,0.06)",
    color: colors.text,
    paddingHorizontal: 14,
    paddingTop: 14,
    textAlignVertical: "top",
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
  },
  dismissButtonText: {
    color: colors.text,
    fontWeight: "800",
  },
  sendButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonText: {
    color: "#000",
    fontWeight: "800",
  },
});