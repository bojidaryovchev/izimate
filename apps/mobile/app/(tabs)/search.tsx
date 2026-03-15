import { useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, TextInput } from "react-native";

import { Text, View, useThemeColor } from "@/components/Themed";
import { useAuth } from "@/lib/auth";
import { searchApi } from "@/lib/client";

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  avatarUrl: string | null;
  rank: number;
}

export default function SearchScreen() {
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({ light: "#ccc", dark: "#555" }, "text");

  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Sign in to test search</Text>
      </View>
    );
  }

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      setSearching(true);
      const res = await searchApi.search(query.trim(), { limit: 20 });
      setResults(res.results);
      setTotal(res.total);
      setSearched(true);
    } catch (e) {
      setResults([]);
      setTotal(0);
      setSearched(true);
    } finally {
      setSearching(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search</Text>
      <Text style={styles.subtitle}>Full-text search across users</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          placeholder="Search..."
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize="none"
        />
      </View>

      {searching && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      {searched && !searching && (
        <Text style={styles.resultCount}>
          {total} result{total !== 1 ? "s" : ""} found
        </Text>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.resultItem}>
            {item.avatarUrl ? (
              <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{item.title.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.resultInfo}>
              <Text style={styles.resultTitle}>{item.title}</Text>
              {item.subtitle && <Text style={styles.resultSubtitle}>{item.subtitle}</Text>}
              <Text style={styles.resultType}>{item.type}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          searched && !searching ? (
            <Text style={styles.emptyText}>No results found</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  inputRow: {
    flexDirection: "row",
    width: "100%",
    marginTop: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  resultCount: {
    marginTop: 12,
    fontSize: 13,
    opacity: 0.6,
  },
  list: {
    width: "100%",
    marginTop: 12,
  },
  listContent: {
    paddingBottom: 40,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(128,128,128,0.3)",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: "rgba(128,128,128,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  resultSubtitle: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
  resultType: {
    fontSize: 11,
    opacity: 0.4,
    marginTop: 2,
    textTransform: "uppercase",
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.5,
    marginTop: 40,
    fontSize: 15,
  },
});
