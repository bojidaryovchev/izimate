import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert, Button, Platform, StyleSheet, TextInput } from "react-native";

import { Text, View } from "@/components/Themed";
import { useUpdateUser, useUser } from "@/lib/hooks";

export default function EditProfileModal() {
  const router = useRouter();
  const { data: user } = useUser();
  const updateUser = useUpdateUser();

  const [name, setName] = useState("");

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  const handleSave = () => {
    if (!name.trim()) return;
    updateUser.mutate(
      { name: name.trim() },
      {
        onSuccess: () => router.back(),
        onError: (err) => Alert.alert("Error", err.message),
      },
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        autoFocus
      />

      <View style={styles.buttonWrap}>
        <Button title={updateUser.isPending ? "Saving..." : "Save"} onPress={handleSave} disabled={updateUser.isPending} />
      </View>

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: "80%",
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  buttonWrap: {
    width: "60%",
  },
});
