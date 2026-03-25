// File: src/screens/member/LiveScreen.js

import React, { useContext, useMemo } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import LiveYoutubePlayer from "../../components/live/LiveYoutubePlayer";
import { useAuth } from "../../context/AuthContext";
import { PurchasesContext } from "../../context/PurchasesContext";

export default function LiveScreen() {
  const { tenant, profile } = useAuth();
  const purchases = useContext(PurchasesContext) || {};

  const isPro = purchases.isPro || false;
  const loading = purchases.loading || false;

  const churchName =
    tenant?.churchName || profile?.churchName || "Church";

  const youtubeSource = useMemo(() => {
    return (
      tenant?.youtubeVideoId ||
      tenant?.youtubeUrl ||
      profile?.youtubeVideoId ||
      profile?.youtubeUrl ||
      ""
    );
  }, [
    tenant?.youtubeVideoId,
    tenant?.youtubeUrl,
    profile?.youtubeVideoId,
    profile?.youtubeUrl,
  ]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Live</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Live Service</Text>
          <Text style={styles.infoText}>
            Watch the current live stream for {churchName}.
          </Text>
        </View>

        {loading ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>Checking access...</Text>
          </View>
        ) : !isPro ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>Church Pro required</Text>
            <Text style={styles.messageText}>
              This live player is currently available for Church Pro.
            </Text>
          </View>
        ) : (
          <LiveYoutubePlayer
            source={youtubeSource}
            title={`${churchName} Live Service`}
            autoPlay={true}
            allowExternalFallback={true}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#020617",
  },
  content: {
    padding: 16,
    gap: 16,
  },
  pageTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
  },
  infoCard: {
    backgroundColor: "#0B1020",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  infoTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  infoText: {
    color: "rgba(255,255,255,0.76)",
    lineHeight: 22,
  },
  messageCard: {
    backgroundColor: "#0B1020",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  messageTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  messageText: {
    color: "rgba(255,255,255,0.76)",
    lineHeight: 22,
  },
});