import { Button, StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import { useAuth } from "@/lib/auth";

export default function TabOneScreen() {
  const { token, isLoading, login, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>iZimate Auth Test</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      {isLoading ? (
        <Text>Loading...</Text>
      ) : token ? (
        <>
          <Text style={styles.status}>Authenticated</Text>
          <Text style={styles.tokenPreview} numberOfLines={3}>
            {token}
          </Text>
          <View style={styles.buttonWrap}>
            <Button title="Sign Out" onPress={logout} color="#e74c3c" />
          </View>
        </>
      ) : (
        <>
          <Text style={styles.status}>Not signed in</Text>
          <View style={styles.buttonWrap}>
            <Button title="Sign In with Auth0" onPress={login} />
          </View>
        </>
      )}
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
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  status: {
    fontSize: 16,
    marginBottom: 12,
  },
  tokenPreview: {
    fontSize: 10,
    opacity: 0.5,
    marginBottom: 16,
    paddingHorizontal: 20,
    textAlign: "center",
  },
  buttonWrap: {
    marginTop: 8,
  },
});
