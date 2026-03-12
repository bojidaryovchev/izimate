import {
  exchangeCodeAsync,
  makeRedirectUri,
  useAuthRequest,
  useAutoDiscovery,
  type TokenResponse,
} from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

const AUTH0_DOMAIN = process.env.EXPO_PUBLIC_AUTH0_DOMAIN!;
const AUTH0_CLIENT_ID = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID!;
const AUTH0_AUDIENCE = process.env.EXPO_PUBLIC_AUTH0_AUDIENCE!;

const TOKEN_KEY = "auth_token";
const REFRESH_KEY = "auth_refresh";

interface AuthContextValue {
  token: string | null;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  token: null,
  isLoading: true,
  login: () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const redirectUri = makeRedirectUri({ scheme: "izimate", path: "auth/callback" });

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const discovery = useAutoDiscovery(`https://${AUTH0_DOMAIN}`);

  const [request, result, promptAsync] = useAuthRequest(
    {
      clientId: AUTH0_CLIENT_ID,
      redirectUri,
      scopes: ["openid", "profile", "email", "offline_access"],
      extraParams: { audience: AUTH0_AUDIENCE },
    },
    discovery,
  );

  // Load stored token on mount
  useEffect(() => {
    SecureStore.getItemAsync(TOKEN_KEY).then((stored) => {
      if (stored) setToken(stored);
      setIsLoading(false);
    });
  }, []);

  // Handle auth response
  useEffect(() => {
    if (result?.type !== "success" || !discovery) return;

    exchangeCodeAsync(
      {
        clientId: AUTH0_CLIENT_ID,
        code: result.params.code,
        redirectUri,
        extraParams: { code_verifier: request!.codeVerifier! },
      },
      discovery,
    ).then(async (tokenResponse: TokenResponse) => {
      const accessToken = tokenResponse.accessToken;
      setToken(accessToken);
      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      if (tokenResponse.refreshToken) {
        await SecureStore.setItemAsync(REFRESH_KEY, tokenResponse.refreshToken);
      }
    });
  }, [result, discovery, request]);

  const login = useCallback(() => {
    promptAsync();
  }, [promptAsync]);

  const logout = useCallback(async () => {
    setToken(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  }, []);

  const value = useMemo(() => ({ token, isLoading, login, logout }), [token, isLoading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
