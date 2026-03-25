// File: src/screens/member/TestimoniesScreen.js

import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import { useAppData } from "../../context/AppDataContext";
import { useAuth } from "../../context/AuthContext";
import { colors, radius, typography } from "../../theme";

export default function TestimoniesScreen() {
  const { testimonies, addTestimony, toggleTestimonyLike, addTestimonyComment, updateTestimonyStatus } = useAppData();
  const { profile, tenant } = useAuth();
  const [text, setText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [commentDrafts, setCommentDrafts] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const role = String(profile?.role || tenant?.role || "MEMBER").toUpperCase();
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(role);

  const visible = useMemo(() => {
    return (testimonies || []).filter((item) => {
      if (isAdmin) return true;
      if (item.status === "APPROVED") return true;
      return item.uid && item.uid === profile?.uid;
    });
  }, [testimonies, isAdmin, profile?.uid]);

  async function handlePost() {
    const cleanText = String(text || "").trim();
    if (!cleanText) {
      Alert.alert("Missing testimony", "Please write your testimony first.");
      return;
    }

    try {
      setSubmitting(true);
      await addTestimony({ text: cleanText, mediaUrl });
      Alert.alert(
        "Submitted",
        isAdmin ? "Testimony posted successfully." : "Your testimony was sent and will appear here while it is waiting for approval."
      );
      setText("");
      setMediaUrl("");
    } catch (error) {
      Alert.alert("Could not post", error?.message || "Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleComment(testimonyId) {
    const message = String(commentDrafts[testimonyId] || "").trim();
    if (!message) return;

    try {
      await addTestimonyComment(testimonyId, message);
      setCommentDrafts((prev) => ({ ...prev, [testimonyId]: "" }));
    } catch (error) {
      Alert.alert("Could not comment", error?.message || "Try again.");
    }
  }

  function renderStatus(item) {
    if (item.status === "APPROVED") return null;
    return <Text style={styles.pending}>Status: {item.status || "PENDING"}</Text>;
  }

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <GlassCard style={styles.topCard}>
            <Text style={styles.title}>Testimonies</Text>
            <Text style={styles.helper}>Share what God has done. Members can like, comment, and encourage one another.</Text>
            <TextInput
              style={[styles.input, styles.large]}
              multiline
              textAlignVertical="top"
              placeholder="Write your testimony"
              placeholderTextColor={colors.textMuted}
              value={text}
              onChangeText={setText}
            />
            <TextInput
              style={styles.input}
              placeholder="Optional photo or video URL"
              placeholderTextColor={colors.textMuted}
              value={mediaUrl}
              onChangeText={setMediaUrl}
              autoCapitalize="none"
            />
            <Pressable style={[styles.button, submitting && styles.buttonDisabled]} onPress={handlePost} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#041217" /> : <Text style={styles.buttonText}>Post Testimony</Text>}
            </Pressable>
          </GlassCard>

          {visible.length === 0 ? (
            <GlassCard><Text style={styles.helper}>No testimonies yet.</Text></GlassCard>
          ) : (
            visible.map((item) => (
              <GlassCard key={item.testimonyId}>
                <Text style={styles.name}>{item.fullName || "Member"}</Text>
                <Text style={styles.body}>{item.text || ""}</Text>
                {!!item.mediaUrl && <Text style={styles.link}>{item.mediaUrl}</Text>}
                {renderStatus(item)}

                <View style={styles.actions}>
                  <Pressable style={styles.smallBtn} onPress={() => toggleTestimonyLike(item)}>
                    <Text style={styles.smallBtnText}>Like ({item.likes || 0})</Text>
                  </Pressable>
                  {isAdmin && item.status !== "APPROVED" ? (
                    <Pressable style={styles.smallBtn} onPress={() => updateTestimonyStatus(item.testimonyId, "APPROVED")}>
                      <Text style={styles.smallBtnText}>Approve</Text>
                    </Pressable>
                  ) : null}
                  {isAdmin && item.status !== "REJECTED" ? (
                    <Pressable style={styles.smallBtn} onPress={() => updateTestimonyStatus(item.testimonyId, "REJECTED")}>
                      <Text style={styles.smallBtnText}>Reject</Text>
                    </Pressable>
                  ) : null}
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Write a comment"
                  placeholderTextColor={colors.textMuted}
                  value={commentDrafts[item.testimonyId] || ""}
                  onChangeText={(value) => setCommentDrafts((prev) => ({ ...prev, [item.testimonyId]: value }))}
                />
                <Pressable style={styles.smallBtn} onPress={() => handleComment(item.testimonyId)}>
                  <Text style={styles.smallBtnText}>Comment</Text>
                </Pressable>

                {(item.comments || []).map((comment) => (
                  <Text key={comment.commentId} style={styles.comment}>• {comment.fullName}: {comment.text}</Text>
                ))}
              </GlassCard>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { paddingHorizontal: 18, paddingTop: 86, paddingBottom: 140, gap: 14 },
  topCard: { marginTop: 0 },
  title: { ...typography.h2, marginBottom: 8 },
  helper: { ...typography.body, marginBottom: 12 },
  input: { minHeight: 48, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.stroke, paddingHorizontal: 14, color: colors.text, backgroundColor: "rgba(255,255,255,0.05)", marginTop: 10 },
  large: { minHeight: 120, paddingTop: 14 },
  button: { marginTop: 12, minHeight: 52, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", backgroundColor: colors.cyan },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: "#041217", fontSize: 16, fontWeight: "900" },
  name: { color: colors.text, fontWeight: "900", marginBottom: 8 },
  body: { color: colors.textSoft, lineHeight: 22 },
  link: { color: colors.cyan, marginTop: 8 },
  pending: { color: "#fbbf24", fontWeight: "800", marginTop: 10 },
  actions: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 12 },
  smallBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: colors.stroke },
  smallBtnText: { color: colors.text, fontWeight: "800" },
  comment: { color: colors.textSoft, marginTop: 8 },
});
