// REPLACE: src/screens/member/HomeScreen.js
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { useAppData } from "../../context/AppDataContext";

export default function HomeScreen() {
  const { churchSettings, refreshChurch } = useAppData();

  const name = churchSettings?.churchName || "Your Church";
  const videoId = churchSettings?.youtubeVideoId || "";

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>{name}</Text>
        <Pressable style={styles.btn} onPress={() => refreshChurch()}>
          <Text style={styles.btnText}>Refresh</Text>
        </Pressable>
      </View>

      {videoId ? (
        <View style={styles.videoWrap}>
          <WebView
            source={{ uri: `https://www.youtube.com/embed/${videoId}` }}
            style={{ flex: 1, borderRadius: 16 }}
            javaScriptEnabled
            domStorageEnabled
          />
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No YouTube video set yet.</Text>
          <Text style={styles.emptySub}>Admin can add it in Admin Dashboard.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f4f6fb", padding: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 22, fontWeight: "900", color: "#0f172a" },
  btn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: "rgba(15,23,42,0.08)", borderWidth: 1, borderColor: "rgba(15,23,42,0.12)" },
  btnText: { fontWeight: "900", color: "#0f172a" },
  videoWrap: { marginTop: 14, height: 260, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(15,23,42,0.10)" },
  empty: { marginTop: 14, borderRadius: 16, padding: 16, backgroundColor: "white", borderWidth: 1, borderColor: "rgba(15,23,42,0.10)" },
  emptyText: { fontWeight: "900", color: "#0f172a" },
  emptySub: { marginTop: 6, color: "#586174", fontWeight: "700" },
});