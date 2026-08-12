import { colors } from "@/constants/theme";
import { useSignInWithGoogle } from "@clerk/expo/google";
import clsx from "clsx";
import { useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

type ContinueWithGoogleProps = {
  label?: string;
  disabled?: boolean;
  showDivider?: boolean;
  onSuccess?: () => void;
};

const isNativePlatform = Platform.OS === "ios" || Platform.OS === "android";

const ContinueWithGoogle = ({
  label = "Continue with Google",
  disabled = false,
  showDivider = true,
  onSuccess,
}: ContinueWithGoogleProps) => {
  const { startGoogleAuthenticationFlow } = useSignInWithGoogle();
  const router = useRouter();
  const posthog = usePostHog();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Native Google Sign-In is unavailable on web.
  if (!isNativePlatform) return null;

  const isDisabled = disabled || loading;

  const handlePress = async () => {
    setError(null);
    setLoading(true);

    try {
      const { createdSessionId, setActive, signIn } =
        await startGoogleAuthenticationFlow();

      if (!createdSessionId || !setActive) {
        posthog.capture("sign_in_failed", {
          method: "google",
          reason: "additional_verification_required",
        });
        setError(
          "Additional verification is required. Please contact support.",
        );
        return;
      }

      const email = signIn?.identifier ?? undefined;
      posthog.identify(
        email ?? createdSessionId,
        email ? { $set: { email } } : undefined,
      );
      posthog.capture("sign_in_succeeded", { method: "google" });

      await setActive({ session: createdSessionId });

      if (onSuccess) {
        onSuccess();
      } else {
        router.replace("/(tabs)");
      }
    } catch (err) {
      const code = (err as { code?: string })?.code;
      // The user dismissed the Google sheet; not an error worth surfacing.
      if (code === "SIGN_IN_CANCELLED" || code === "-5") {
        posthog.capture("sign_in_cancelled", { method: "google" });
        return;
      }

      console.error("Google sign-in failed", err);
      posthog.capture("sign_in_failed", {
        method: "google",
        reason: "unexpected_error",
      });
      setError("We couldn't sign you in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {showDivider && (
        <View className="auth-divider-row">
          <View className="auth-divider-line" />
          <Text className="auth-divider-text">or</Text>
          <View className="auth-divider-line" />
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        android_ripple={{ color: "rgba(8,17,38,0.08)" }}
        onPress={handlePress}
        style={({ pressed }) => ({
          opacity: pressed && !isDisabled ? 0.85 : 1,
        })}
      >
        <View
          className={clsx(
            "auth-google-button",
            isDisabled && "auth-google-button-disabled",
          )}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <View className="auth-google-mark">
                <Text className="auth-google-mark-text">G</Text>
              </View>
              <Text className="auth-google-button-text">{label}</Text>
            </>
          )}
        </View>
      </Pressable>

      {error && <Text className="auth-error mt-2">{error}</Text>}
    </View>
  );
};

export default ContinueWithGoogle;
