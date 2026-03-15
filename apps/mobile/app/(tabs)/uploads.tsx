import { useState } from "react";
import { ActivityIndicator, Alert, Button, Image, StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import { useAuth } from "@/lib/auth";
import { pickAndUploadImage, takeAndUploadPhoto } from "@/lib/uploads";

export default function UploadsScreen() {
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ publicUrl: string; key: string } | null>(null);

  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Sign in to test uploads</Text>
      </View>
    );
  }

  const handlePick = async () => {
    try {
      setUploading(true);
      const res = await pickAndUploadImage();
      if (res) setResult(res);
    } catch (e) {
      Alert.alert("Upload failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setUploading(false);
    }
  };

  const handleCamera = async () => {
    try {
      setUploading(true);
      const res = await takeAndUploadPhoto();
      if (res) setResult(res);
    } catch (e) {
      Alert.alert("Upload failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image Upload</Text>
      <Text style={styles.subtitle}>Test uploading images to R2 via presigned URLs</Text>

      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      {uploading ? (
        <ActivityIndicator size="large" style={{ marginVertical: 20 }} />
      ) : (
        <>
          <View style={styles.buttonWrap}>
            <Button title="Pick from Library" onPress={handlePick} />
          </View>
          <View style={styles.buttonWrap}>
            <Button title="Take Photo" onPress={handleCamera} />
          </View>
        </>
      )}

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>Upload Successful!</Text>
          <Image source={{ uri: result.publicUrl }} style={styles.preview} />
          <Text style={styles.keyText} numberOfLines={2}>
            Key: {result.key}
          </Text>
          <Text style={styles.urlText} numberOfLines={2}>
            URL: {result.publicUrl}
          </Text>
        </View>
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
  buttonWrap: {
    marginTop: 8,
    width: "70%",
  },
  resultContainer: {
    marginTop: 24,
    alignItems: "center",
    width: "90%",
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2ecc71",
    marginBottom: 12,
  },
  preview: {
    width: 150,
    height: 150,
    borderRadius: 12,
    marginBottom: 12,
  },
  keyText: {
    fontSize: 11,
    opacity: 0.5,
    textAlign: "center",
  },
  urlText: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 4,
    textAlign: "center",
  },
});
