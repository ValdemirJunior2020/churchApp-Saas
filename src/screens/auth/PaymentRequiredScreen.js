// File: src/screens/auth/PaymentRequiredScreen.js

import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { PurchasesContext } from '../../context/PurchasesContext';
import {
  purchasePackage,
  restorePurchases,
} from '../../services/purchases';

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // make sure this exists
import { useAuth } from '../../context/AuthContext';

export default function PaymentRequiredScreen() {
  const { offerings, setIsPro } = useContext(PurchasesContext);
  const { tenant } = useAuth();

  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    try {
      setLoading(true);

      const pkg = offerings?.availablePackages[0];

      const customerInfo = await purchasePackage(pkg);

      if (customerInfo.entitlements.active['pro']) {
        setIsPro(true);

        // 🔥 SAVE TO FIREBASE
        await updateDoc(doc(db, "churches", tenant.id), {
          plan: "PRO",
          subscriptionStatus: "ACTIVE",
          updatedAt: Date.now(),
        });
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      const customerInfo = await restorePurchases();

      if (customerInfo.entitlements.active['pro']) {
        setIsPro(true);

        // 🔥 SAVE TO FIREBASE ON RESTORE
        await updateDoc(doc(db, "churches", tenant.id), {
          plan: "PRO",
          subscriptionStatus: "RESTORED",
          updatedAt: Date.now(),
        });
      } else {
        Alert.alert('No purchases found');
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  if (!offerings) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>
        Unlock Premium
      </Text>

      <Button title="Subscribe" onPress={handleBuy} />

      <View style={{ marginTop: 20 }}>
        <Button title="Restore Purchases" onPress={handleRestore} />
      </View>

      {loading && <ActivityIndicator />}
    </View>
  );
}