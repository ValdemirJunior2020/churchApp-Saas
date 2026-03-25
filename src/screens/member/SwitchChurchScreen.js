import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";

const COLORS = {
  bg: "#05060A",
  card: "rgba(22,22,28,0.88)",
  border: "rgba(255,255,255,0.12)",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.72)",
  active: "#2ED8F3",
  danger: "#FF6B6B",
};

export default function SwitchChurchScreen({ navigation }) {
  const { user, userProfile, setUserProfile } = useAuth();
  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyChurchId, setBusyChurchId] = useState(null);

  const activeChurchId = userProfile?.churchId || null;
  const role = String(userProfile?.role || "member").toLowerCase();
  const canLeave =
    role !== "owner" && role !== "pastor" && role !== "admin" && role !== "superadmin";

  useEffect(() => {
    let mounted = true;

    async function loadChurches() {
      if (!user?.uid) {
        if (mounted) {
          setChurches([]);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);

        const membershipsRef = collection(db, "users", user.uid, "memberships");
        const membershipsSnap = await getDocs(membershipsRef);

        const rows = membershipsSnap.docs.map((snap) => ({
          id: snap.id,
          ...snap.data(),
        }));

        if (mounted) {
          setChurches(rows.sort((a, b) => {
            const aName = String(a.churchName || "").toLowerCase();
            const bName = String(b.churchName || "").toLowerCase();
            return aName.localeCompare(bName);
          }));
        }
      } catch (error) {
        console.log("switchChurch:load:error", error);
        Alert.alert("Load failed", error?.message || "Could not load your churches.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadChurches();
    return () => {
      mounted = false;
    };
  }, [user?.uid]);

  const hasMultipleChurches = useMemo(() => churches.length > 1, [churches.length]);

  async function handleSwitch(item) {
    if (!user?.uid || !item?.churchId || item.churchId === activeChurchId) return;

    try {
      setBusyChurchId(item.churchId);

      await updateDoc(doc(db, "users", user.uid), {
        churchId: item.churchId,
        churchName: item.churchName || "",
        role: item.role || userProfile?.role || "member",
        updatedAt: serverTimestamp(),
      });

      const nextProfile = {
        ...(userProfile || {}),
        churchId: item.churchId,
        churchName: item.churchName || "",
        role: item.role || userProfile?.role || "member",
      };

      if (typeof setUserProfile === "function") {
        setUserProfile(nextProfile);
      }

      Alert.alert("Switched", `You are now in ${item.churchName || "the selected church"}.`, [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.log("switchChurch:switch:error", error);
      Alert.alert("Switch failed", error?.message || "Could not switch church.");
    } finally {
      setBusyChurchId(null);
    }
  }

  async function handleLeave(item) {
    if (!user?.uid || !item?.churchId) return;

    if (!canLeave) {
      Alert.alert(
        "Cannot leave",
        "Owners, pastors, admins, and super admins cannot leave from here."
      );
      return;
    }

    Alert.alert(
      "Leave church?",
      `This will remove you from ${item.churchName || "this church"}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              setBusyChurchId(item.churchId);

              await deleteDoc(doc(db, "churches", item.churchId, "members", user.uid));
              await deleteDoc(doc(db, "users", user.uid, "memberships", item.churchId));

              const churchRef = doc(db, "churches", item.churchId);
              await updateDoc(churchRef, {
                memberCount: increment(-1),
                updatedAt: serverTimestamp(),
              });

              const nextChurches = churches.filter((church) => church.churchId !== item.churchId);
              setChurches(nextChurches);

              if (activeChurchId === item.churchId) {
                if (nextChurches.length > 0) {
                  const fallback = nextChurches[0];
                  await updateDoc(doc(db, "users", user.uid), {
                    churchId: fallback.churchId,
                    churchName: fallback.churchName || "",
                    role: fallback.role || "member",
                    updatedAt: serverTimestamp(),
                  });

                  if (typeof setUserProfile === "function") {
                    setUserProfile({
                      ...(userProfile || {}),
                      churchId: fallback.churchId,
                      churchName: fallback.churchName || "",
                      role: fallback.role || "member",
                    });
                  }
                } else {
                  await updateDoc(doc(db, "users", user.uid), {
                    churchId: null,
                    churchName: "",
                    role: "member",
                    updatedAt: serverTimestamp(),
                  });

                  if (typeof setUserProfile === "function") {
                    setUserProfile({
                      ...(userProfile || {}),
                      churchId: null,
                      churchName: "",
                      role: "member",
                    });
                  }
                }
              }

              Alert.alert("Left church", "Your membership was removed.");
            } catch (error) {
              console.log("switchChurch:leave:error", error);
              Alert.alert("Leave failed", error?.message || "Could not leave church.");
            } finally {
              setBusyChurchId(null);
            }
          },
        },
      ]
    );
  }

  function renderItem({ item }) {
    const isActive = item.churchId === activeChurchId;
    const isBusy = busyChurchId === item.churchId;

    return (
      <View style={[styles.card, isActive && styles.cardActive]}>
        <View style={styles.rowTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.churchName || "Church"}</Text>
            <Text style={styles.meta}>
              Code: {item.churchCode || "-"} � Role: {item.role || "member"}
            </Text>
          </View>

          {isActive ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Current</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable
            disabled={isBusy || isActive}
            onPress={() => handleSwitch(item)}
            style={[styles.primaryButton, (isBusy || isActive) && styles.disabled]}
          >
            <Text style={styles.primaryText}>
              {isBusy ? "Working..." : isActive ? "Active" : "Switch"}
            </Text>
          </Pressable>

          <Pressable
            disabled={isBusy || !canLeave || (!hasMultipleChurches && isActive)}
            onPress={() => handleLeave(item)}
            style={[
              styles.secondaryButton,
              (isBusy || !canLeave || (!hasMultipleChurches && isActive)) && styles.disabled,
            ]}
          >
            <Text style={styles.secondaryText}>Leave</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.active} />
        </View>
      ) : (
        <FlatList
          data={churches}
          keyExtractor={(item) => item.churchId || item.id}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <View style={styles.headerCard}>
              <Text style={styles.headerTitle}>Switch Church</Text>
              <Text style={styles.headerText}>
                Choose which church you want to open right now. Your active church controls the
                home feed, people, testimonies, prayer, and giving screens.
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.card}>
              <Text style={styles.emptyText}>No linked churches found yet.</Text>
            </View>
          }
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, paddingBottom: 120 },
  headerCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
  },
  headerText: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
  },
  cardActive: {
    borderColor: "rgba(46,216,243,0.35)",
  },
  rowTop: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },
  meta: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(46,216,243,0.12)",
    borderWidth: 1,
    borderColor: "rgba(46,216,243,0.25)",
  },
  badgeText: {
    color: COLORS.active,
    fontSize: 12,
    fontWeight: "900",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 999,
    backgroundColor: COLORS.active,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    color: "#041217",
    fontSize: 16,
    fontWeight: "900",
  },
  secondaryButton: {
    minWidth: 96,
    minHeight: 50,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  secondaryText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: "900",
  },
  disabled: {
    opacity: 0.55,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 15,
    fontWeight: "700",
  },
});
