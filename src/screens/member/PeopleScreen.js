// File: src/screens/member/PeopleScreen.js

import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import AmbientBackground from "../../components/AmbientBackground";
import GlassCard from "../../components/GlassCard";
import ChurchBrandHeader from "../../components/ChurchBrandHeader";
import { useAppData } from "../../context/AppDataContext";
import { colors, typography } from "../../theme";

export default function PeopleScreen() {
  const { members, newGuests } = useAppData();
  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <ChurchBrandHeader title="People" subtitle="Members and new guests in your church community." centered showChurchCode />
          <GlassCard>
            <Text style={styles.title}>Members</Text>
            {(members || []).length === 0 ? <Text style={styles.helper}>No members yet.</Text> : (
              (members || []).map((item) => (
                <View key={item.id || item.uid} style={styles.row}>
                  <Text style={styles.name}>{item.fullName || "Member"}</Text>
                  <Text style={styles.meta}>{item.email || ""}</Text>
                  <Text style={styles.meta}>{String(item.role || "MEMBER").toUpperCase()}</Text>
                </View>
              ))
            )}
          </GlassCard>
          <GlassCard>
            <Text style={styles.title}>New Guests</Text>
            {(newGuests || []).length === 0 ? <Text style={styles.helper}>No guest cards submitted yet.</Text> : (
              (newGuests || []).map((item) => (
                <View key={item.guestId} style={styles.row}>
                  <Text style={styles.name}>{item.fullName || "Guest"}</Text>
                  <Text style={styles.meta}>{item.email || item.phone || ""}</Text>
                  <Text style={styles.meta}>{(item.interests || []).join(", ")}</Text>
                </View>
              ))
            )}
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 140, gap: 14 },
  title: { ...typography.h3, marginBottom: 10 },
  helper: { ...typography.body },
  row: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.stroke },
  name: { color: colors.text, fontWeight: "800" },
  meta: { color: colors.textSoft, marginTop: 4 },
});
