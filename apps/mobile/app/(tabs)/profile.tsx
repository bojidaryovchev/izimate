import { useRouter } from "expo-router";
import { ActivityIndicator, Image, StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import { useAuth } from "@/lib/auth";
import { useUser } from "@/lib/hooks";
import { Button } from "react-native";

export default function ProfileScreen() {
  const { token, logout } = useAuth();
  const { data: user, isLoading, error } = useUser();
  const router = useRouter();

  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Not signed in</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Failed to load profile</Text>
        <Text>{error?.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user.avatarUrl && (
        <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
      )}
      <Text style={styles.title}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>

      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      <View style={styles.buttonWrap}>
        <Button title="Edit Profile" onPress={() => router.push("/modal")} />
      </View>
      <View style={styles.buttonWrap}>
        <Button title="Sign Out" onPress={logout} color="#e74c3c" />
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  email: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  separator: {
    marginVertical: 24,
    height: 1,
    width: "80%",
  },
  buttonWrap: {
    marginTop: 8,
    width: "60%",
  },
});
