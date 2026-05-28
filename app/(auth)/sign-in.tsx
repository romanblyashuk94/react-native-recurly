import AuthBrand from "@/components/AuthBrand";
import AuthButton from "@/components/AuthButton";
import AuthField from "@/components/AuthField";
import { validateEmail } from "@/lib/validation";
import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import { useRef, useState } from "react";
import { usePostHog } from "posthog-react-native";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const posthog = usePostHog();

  const passwordRef = useRef<TextInput>(null);

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  const [localEmailError, setLocalEmailError] = useState<string | null>(null);
  const [localPasswordError, setLocalPasswordError] = useState<string | null>(
    null,
  );
  const [generalError, setGeneralError] = useState<string | null>(null);

  const isFetching = fetchStatus === "fetching";

  const emailError =
    localEmailError ?? errors?.fields?.identifier?.message ?? null;
  const passwordError =
    localPasswordError ?? errors?.fields?.password?.message ?? null;
  const globalError = generalError ?? errors?.global?.[0]?.message ?? null;

  const canSubmit = emailAddress.trim().length > 0 && password.length > 0;

  const handleSubmit = async () => {
    setGeneralError(null);

    const emailErr = validateEmail(emailAddress);
    setLocalEmailError(emailErr);
    setLocalPasswordError(
      password.length === 0 ? "Password is required" : null,
    );
    if (emailErr || password.length === 0) return;

    try {
      const { error } = await signIn.password({
        emailAddress: emailAddress.trim(),
        password,
      });

      if (error) {
        posthog.capture("sign_in_failed", {
          reason: "credential_error",
        });
        if (!errors?.fields?.identifier && !errors?.fields?.password) {
          setGeneralError(
            "We couldn't sign you in. Please check your email and password.",
          );
        }
        return;
      }

      if (signIn.status === "complete") {
        const userId = signIn.createdSessionId ?? emailAddress.trim();
        posthog.identify(userId, {
          $set: { email: emailAddress.trim() },
        });
        posthog.capture("sign_in_succeeded");
        await signIn.finalize({
          navigate: ({ session }) => {
            if (session?.currentTask) return;
            router.replace("/(tabs)");
          },
        });
      } else {
        posthog.capture("sign_in_failed", {
          reason: "additional_verification_required",
        });
        setGeneralError(
          "Additional verification is required. Please contact support.",
        );
      }
    } catch (err) {
      console.error("Sign-in failed", err);
      posthog.capture("sign_in_failed", { reason: "unexpected_error" });
      setGeneralError(
        "Something went wrong while signing you in. Please try again.",
      );
      return;
    }
  };

  return (
    <SafeAreaView className="auth-safe-area" edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        className="auth-scroll"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthBrand />

          <Text className="auth-title">Welcome back</Text>
          <Text className="auth-subtitle">
            Sign in to keep your subscriptions, renewals, and spend in one
            place.
          </Text>

          <View className="auth-card">
            <View className="auth-form">
              <AuthField
                label="Email"
                placeholder="you@example.com"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                returnKeyType="next"
                value={emailAddress}
                onChangeText={(v) => {
                  setEmailAddress(v);
                  if (localEmailError) setLocalEmailError(null);
                  if (generalError) setGeneralError(null);
                }}
                onSubmitEditing={() => passwordRef.current?.focus()}
                error={emailError}
                editable={!isFetching}
              />

              <AuthField
                ref={passwordRef}
                label="Password"
                placeholder="Your password"
                isPassword
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                returnKeyType="go"
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  if (localPasswordError) setLocalPasswordError(null);
                  if (generalError) setGeneralError(null);
                }}
                onSubmitEditing={handleSubmit}
                error={passwordError}
                editable={!isFetching}
              />

              {globalError && <Text className="auth-error">{globalError}</Text>}

              <AuthButton
                label="Sign in"
                onPress={handleSubmit}
                loading={isFetching}
                disabled={!canSubmit || isFetching}
              />
            </View>
          </View>

          <View className="auth-link-row">
            <Text className="auth-link-copy">New to Recurly?</Text>
            <Link href="/(auth)/sign-up" asChild>
              <Pressable hitSlop={8}>
                <Text className="auth-link">Create an account</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
