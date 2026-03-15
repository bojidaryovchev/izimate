import { useState } from "react";
import { ActivityIndicator, Alert, Button, Linking, StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import { useAuth } from "@/lib/auth";
import { paymentsApi } from "@/lib/client";

export default function PaymentsScreen() {
  const { token } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Sign in to test payments</Text>
      </View>
    );
  }

  const handleCheckout = async () => {
    try {
      setLoading("checkout");
      const { url } = await paymentsApi.createCheckout(
        "price_test_placeholder",
        "https://izimate.com/success",
        "https://izimate.com/cancel",
      );
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert("Checkout failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(null);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading("connect");
      const { url } = await paymentsApi.createConnectLink(
        "https://izimate.com/connect/return",
        "https://izimate.com/connect/refresh",
      );
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert("Connect failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payments</Text>
      <Text style={styles.subtitle}>Test Stripe Checkout & Connect integration</Text>

      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stripe Checkout</Text>
        <Text style={styles.sectionDesc}>Creates a checkout session and opens the Stripe payment page</Text>
        <View style={styles.buttonWrap}>
          {loading === "checkout" ? (
            <ActivityIndicator />
          ) : (
            <Button title="Start Checkout" onPress={handleCheckout} />
          )}
        </View>
      </View>

      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stripe Connect</Text>
        <Text style={styles.sectionDesc}>Creates a Connect onboarding link for seller accounts</Text>
        <View style={styles.buttonWrap}>
          {loading === "connect" ? (
            <ActivityIndicator />
          ) : (
            <Button title="Start Connect Onboarding" onPress={handleConnect} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
    textAlign: "center",
  },
  separator: {
    marginVertical: 24,
    height: 1,
    width: "80%",
  },
  section: {
    alignItems: "center",
    width: "100%",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    opacity: 0.5,
    textAlign: "center",
    marginBottom: 12,
  },
  buttonWrap: {
    width: "70%",
  },
});
