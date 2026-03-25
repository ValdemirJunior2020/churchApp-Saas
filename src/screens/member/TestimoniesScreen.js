// File: src/screens/member/TestimoniesScreen.js

import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  increment,
} from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";

const COLORS = {
  bg: "#05060A",
  card: "rgba(22,22,28,0.84)",
  border: "rgba(255,255,255,0.12)",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.72)",
  active: "#2ED8F3",
  warning: "#F4C27A",
};

function formatFallbackDate(value) {
  if (!value) return "";
  try {
    const date =
      typeof value?.toDate === "function" ? value.toDate() : new Date(value);
    return date.toLocaleDateString();
  } catch {
    return "";
  }
}

export default function TestimoniesScreen() {
  const { user, userProfile } = useAuth();

  const [body, setBody] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [items, setItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const churchId = userProfile?.churchId || null;
  const isPastorOrAdmin = useMemo(() => {
    const role = String(userProfile?.role || "").toLowerCase();
    return role === "owner" || role === "pastor" || role === "admin" || role === "superadmin";
  }, [userProfile?.role]);

  useEffect(() => {
    if (!churchId || !user?.uid) {
      setItems([]);
      setLoading(false);
      return;
    }

    const ref = collection(db, "churches", churchId, "testimonies");
    const q = query(ref, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rows = snapshot.docs
          .map((snap) => ({
            id: snap.id,
            ...snap.data(),
          }))
          .filter((item) => {
            if (isPastorOrAdmin) return true;
            if (item.status === "APPROVED") return true;
            return item.authorId === user.uid;
          });

        setItems(rows);
        setLoading(false);
      },
      (error) => {
        console.log("testimonies:onSnapshot:error", error);
        setLoading(false);
        Alert.alert(
          "Testimonies error",
          "Could not load testimonies. Check Firestore rules."
        );
      }
    );

    return unsubscribe;
  }, [churchId, user?.uid, isPastorOrAdmin]);

  async function handleSubmit() {
    if (!churchId || !user?.uid) {
      Alert.alert("Missing church", "Your account is not connected to a church.");
      return;
    }

    const trimmedBody = body.trim();
    const trimmedMediaUrl = mediaUrl.trim();

    if (!trimmedBody) {
      Alert.alert("Missing testimony", "Please write your testimony first.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        churchId,
        authorId: user.uid,
        authorName:
          userProfile?.fullName ||
          userProfile?.displayName ||
          user?.displayName ||
          "Member",
        authorEmail: user?.email || "",
        text: trimmedBody,
        mediaUrl: trimmedMediaUrl || "",
        status: isPastorOrAdmin ? "APPROVED" : "PENDING",
        likesCount: 0,
        commentsCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "churches", churchId, "testimonies"), payload);

      setBody("");
      setMediaUrl("");

      Alert.alert(
        "Submitted",
        isPastorOrAdmin
          ? "Your testimony is now live."
          : "Your testimony was submitted and is visible to you while awaiting approval."
      );
    } catch (error) {
      console.log("testimonies:submit:error", error);
      Alert.alert(
        "Submit failed",
        error?.message || "Could not submit testimony."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLike(item) {
    if (!churchId || !item?.id) return;

    try {
      const ref = doc(db, "churches", churchId, "testimonies", item.id);
      await updateDoc(ref, {
        likesCount: increment(1),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.log("testimonies:like:error", error);
      Alert.alert("Like failed", error?.message || "Could not like testimony.");
    }
  }

  async function handleApprove(item) {
    if (!churchId || !item?.id || !isPastorOrAdmin) return;

    try {
      const ref = doc(db, "churches", churchId, "testimonies", item.id);
      await updateDoc(ref, {
        status: "APPROVED",
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.log("testimonies:approve:error", error);
      Alert.alert(
        "Approve failed",
        error?.message || "Could not approve testimony."
      );
    }
  }

  async function handleComment(item) {
    if (!churchId || !item?.id || !user?.uid) return;

    try {
      const commentText = `Amen — encouraged by this testimony.`;
      const testimonyRef = doc(db, "churches", churchId, "testimonies", item.id);
      const testimonySnap = await getDoc(testimonyRef);

      if (!testimonySnap.exists()) {
        Alert.alert("Missing", "This testimony no longer exists.");
        return;
      }

      await addDoc(
        collection(db, "churches", churchId, "testimonies", item.id, "comments"),
        {
          churchId,
          testimonyId: item.id,
          uid: user.uid,
          name:
            userProfile?.fullName ||
            userProfile?.displayName ||
            user?.displayName ||
            "Member",
          text: commentText,
          createdAt: serverTimestamp(),
        }
      );

      await updateDoc(testimonyRef, {
        commentsCount: increment(1),
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Comment added", "A sample encouragement comment was added.");
    } catch (error) {
      console.log("testimonies:comment:error", error);
      Alert.alert(
        "Comment failed",
        error?.message || "Could not add comment."
      );
    }
  }

  function renderItem({ item }) {
    const isPending = item.status === "PENDING";

    return (
      <View style={styles.feedCard}>
        <View style={styles.feedHeader}>
          <View>
            <Text style={styles.author}>{item.authorName || "Member"}</Text>
            <Text style={styles.meta}>
              {isPending ? "Pending approval" : "Live"}{" "}
              {formatFallbackDate(item.createdAt)}
            </Text>
          </View>

          {isPending && isPastorOrAdmin ? (
            <Pressable style={styles.approveButton} onPress={() => handleApprove(item)}>
              <Text style={styles.approveText}>Approve</Text>
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.body}>{item.text}</Text>

        {item.mediaUrl ? (
          <Text style={styles.mediaText}>Media: {item.mediaUrl}</Text>
        ) : null}

        <View style={styles.actions}>
          <Pressable style={styles.actionButton} onPress={() => handleLike(item)}>
            <Text style={styles.actionText}>Like ({item.likesCount || 0})</Text>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={() => handleComment(item)}>
            <Text style={styles.actionText}>Comment ({item.commentsCount || 0})</Text>
          </Pressable>

          <Pressable style={styles.actionButton}>
            <Text style={styles.actionText}>Share</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <View style={styles.card}>
              <Text style={styles.title}>Testimonies</Text>
              <Text style={styles.subtitle}>
                Share what God has done. Members can like, comment, and encourage one another.
              </Text>

              <TextInput
                value={body}
                onChangeText={setBody}
                placeholder="Write your testimony..."
                placeholderTextColor="rgba(255,255,255,0.45)"
                multiline
                style={[styles.input, styles.textarea]}
              />

              <TextInput
                value={mediaUrl}
                onChangeText={setMediaUrl}
                placeholder="Optional photo or video URL"
                placeholderTextColor="rgba(255,255,255,0.45)"
                autoCapitalize="none"
                style={styles.input}
              />

              <Pressable
                onPress={handleSubmit}
                disabled={submitting}
                style={[styles.submitButton, submitting && styles.disabled]}
              >
                <Text style={styles.submitText}>
                  {submitting ? "Posting..." : "Post Testimony"}
                </Text>
              </Press>

              {!isPastorOrAdmin ? (
                <Text style={styles.note}>
                  Member testimonies are submitted as pending first. You can still see your own post immediately.
                </Text>
              ) : null}
            </View>

            {loading ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator color={COLORS.active} />
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No testimonies yet.</Text>
            </View>
          ) : null
        }
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
    gap: 14,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  loadingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 16,
    fontWeight: "700",
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  input: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 14,
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 12,
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: "top",
    paddingTop: 14,
  },
  submitButton: {
    minHeight: 56,
    borderRadius: 999,
    backgroundColor: COLORS.active,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitText: {
    color: "#041217",
    fontSize: 18,
    fontWeight: "900",
  },
  disabled: {
    opacity: 0.6,
  },
  note: {
    color: COLORS.warning,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 12,
    lineHeight: 18,
  },
  feedCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  feedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  author: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
  },
  meta: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  body: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  mediaText: {
    color: COLORS.active,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  actionText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },
  approveButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(46,216,243,0.12)",
    borderWidth: 1,
    borderColor: "rgba(46,216,243,0.25)",
  },
  approveText: {
    color: COLORS.active,
    fontSize: 12,
    fontWeight: "900",
  },
});