// File: src/screens/premium/PremiumScreen.js

import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PurchasesContext } from "../../context/PurchasesContext";
import { purchasePackage, restorePurchases } from "../../services/purchases";

export default function PremiumScreen({ visible, onClose }) {
  const { offerings, setIsPro } = useContext(PurchasesContext);
  const [loading, setLoading] = useState(false);

  const pkg = offerings?.availablePackages?.[0];

  const handleBuy = async () => {
    try {
      setLoading(true);
      const customerInfo = await purchasePackage(pkg);

      if (customerInfo.entitlements.active["pro"]) {
        setIsPro(true);
        onClose?.();
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    const customerInfo = await restorePurchases();
    if (customerInfo.entitlements.active["pro"]) {
      setIsPro(true);
      onClose?.();
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <LinearGradient
          colors={["#0a0a0f", "#12121a", "#0a0a0f"]}
          style={styles.container}
        >
          <Text style={styles.title}>Grow Your Church 🚀</Text>

          <Text style={styles.subtitle}>
            Unlock powerful tools to connect, stream, and manage your church.
          </Text>

          <View style={styles.features}>
            <Text style={styles.item}>• Live streaming</Text>
            <Text style={styles.item}>• Member management</Text>
            <Text style={styles.item}>• Events & Giving</Text>
            <Text style={styles.item}>• Church community chat</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleBuy}>
            <Text style={styles.buttonText}>
              Start 7-Day Free Trial
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRestore}>
            <Text style={styles.restore}>Restore Purchases</Text>
          </TouchableOpacity>

          {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    borderRadius: 30,
    padding: 25,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 10,
  },
  subtitle: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: 20,
  },
  features: {
    marginBottom: 20,
  },
  item: {
    color: "#fff",
    marginVertical: 4,
  },
  button: {
    backgroundColor: "#00e5ff",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  buttonText: {
    color: "#000",
    fontWeight: "800",
  },
  restore: {
    marginTop: 15,
    color: "#ccc",
  },
});