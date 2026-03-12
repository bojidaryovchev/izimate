import { Redirect } from "expo-router";

export default function AuthCallback() {
  // expo-auth-session handles the token exchange via useAuthRequest hook.
  // This route exists only so Expo Router doesn't show "screen doesn't exist"
  // when Auth0 redirects back to izimate://auth/callback.
  return <Redirect href="/" />;
}
