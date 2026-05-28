import AuthBrand from "@/components/AuthBrand";
import AuthButton from "@/components/AuthButton";
import AuthField from "@/components/AuthField";
import {
  validateEmail,
  validatePassword,
  validateVerificationCode,
} from "@/lib/validation";
import { useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import { useMemo, useRef, useState } from "react";
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
export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();
  const posthog = usePostHog();

  const passwordRef = useRef<TextInput>(null);

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const [localEmailError, setLocalEmailError] = useState<string | null>(null);
  const [localPasswordError, setLocalPasswordError] = useState<string | null>(
    null,
  );
  const [localCodeError, setLocalCodeError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const isFetching = fetchStatus === "fetching";

  const needsVerification = useMemo(
    () =>
      signUp.status === "missing_requirements" &&
      signUp.unverifiedFields.includes("email_address"),
    [signUp.status, signUp.unverifiedFields],
  );

  const emailError =
    localEmailError ?? errors?.fields?.emailAddress?.message ?? null;
  const passwordError =
    localPasswordError ?? errors?.fields?.password?.message ?? null;
  const codeError = localCodeError ?? errors?.fields?.code?.message ?? null;
  const globalError = generalError ?? errors?.global?.[0]?.message ?? null;

  const credentialsValid =
    emailAddress.trim().length > 0 && password.length > 0;

  const goHome = async () => {
    await signUp.finalize({
      navigate: ({ session }) => {
        if (session?.currentTask) return;
        router.replace("/(tabs)");
      },
    });
  };

  const handleSubmit = async () => {
    setGeneralError(null);
    const emailErr = validateEmail(emailAddress);
    const passwordErr = validatePassword(password);
    setLocalEmailError(emailErr);
    setLocalPasswordError(passwordErr);
    if (emailErr || passwordErr) return;

    const { error } = await signUp.password({
      emailAddress: emailAddress.trim(),
      password,
    });

    if (error) {
      posthog.capture("sign_up_failed", { reason: "credential_error" });
      if (!errors?.fields?.emailAddress && !errors?.fields?.password) {
        setGeneralError("We couldn't create your account. Please try again.");
      }
      return;
    }

    posthog.capture("sign_up_submitted", { email: emailAddress.trim() });

    if (signUp.status === "complete") {
      posthog.identify(emailAddress.trim(), {
        $set: { email: emailAddress.trim() },
        $set_once: { signup_date: new Date().toISOString() },
      });
      await goHome();
      return;
    }

    const codeResult = await signUp.verifications.sendEmailCode();
    if (codeResult.error) {
      setGeneralError(
        "We couldn't send a verification code. Please try again.",
      );
    }
  };

  const handleVerify = async () => {
    setGeneralError(null);
    const codeErr = validateVerificationCode(code);
    setLocalCodeError(codeErr);
    if (codeErr) return;

    const { error } = await signUp.verifications.verifyEmailCode({
      code: code.trim(),
    });
    if (error) {
      if (!errors?.fields?.code) {
        setGeneralError(
          "We couldn't verify that code. Please request a new one.",
        );
      }
      return;
    }

    if (signUp.status === "complete") {
      const email = (signUp.emailAddress ?? emailAddress).trim();
      posthog.identify(email, {
        $set: { email },
        $set_once: { signup_date: new Date().toISOString() },
      });
      posthog.capture("sign_up_email_verified", { email });
      await goHome();
    } else {
      setGeneralError(
        "Verification succeeded, but more info is needed. Please contact support.",
      );
    }
  };

  const handleResend = async () => {
    setGeneralError(null);
    setLocalCodeError(null);
    setCode("");
    const { error } = await signUp.verifications.sendEmailCode();
    if (error) {
      setGeneralError("We couldn't resend the code. Please try again.");
    }
  };

  const handleStartOver = async () => {
    setLocalEmailError(null);
    setLocalPasswordError(null);
    setLocalCodeError(null);
    setGeneralError(null);
    setCode("");
    await signUp.reset();
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

          {!needsVerification ? (
            <>
              <Text className="auth-title">Create your account</Text>
              <Text className="auth-subtitle">
                Track every subscription, see your true spend, and never get
                surprised by a renewal again.
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
                    placeholder="At least 8 characters"
                    isPassword
                    autoComplete="password-new"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="newPassword"
                    returnKeyType="go"
                    value={password}
                    onChangeText={(v) => {
                      setPassword(v);
                      if (localPasswordError) setLocalPasswordError(null);
                      if (generalError) setGeneralError(null);
                    }}
                    onSubmitEditing={handleSubmit}
                    error={passwordError}
                    hint="Use 8+ characters with letters and numbers."
                    editable={!isFetching}
                  />

                  {globalError && (
                    <Text className="auth-error">{globalError}</Text>
                  )}

                  <AuthButton
                    label="Create account"
                    onPress={handleSubmit}
                    loading={isFetching}
                    disabled={!credentialsValid || isFetching}
                  />

                  <Text className="auth-helper text-center">
                    By continuing, you agree to our Terms and acknowledge our
                    Privacy Policy.
                  </Text>
                </View>
              </View>

              <View className="auth-link-row">
                <Text className="auth-link-copy">Already have an account?</Text>
                <Link href="/(auth)/sign-in" asChild>
                  <Pressable hitSlop={8}>
                    <Text className="auth-link">Sign in</Text>
                  </Pressable>
                </Link>
              </View>

              <View nativeID="clerk-captcha" />
            </>
          ) : (
            <>
              <Text className="auth-title">Verify your email</Text>
              <Text className="auth-subtitle">
                Enter the 6-digit code we just sent to{" "}
                <Text className="font-sans-bold text-primary">
                  {(signUp.emailAddress ?? emailAddress).trim()}
                </Text>
                .
              </Text>

              <View className="auth-card">
                <View className="auth-form">
                  <AuthField
                    label="Verification code"
                    placeholder="123456"
                    keyboardType="number-pad"
                    autoComplete="one-time-code"
                    textContentType="oneTimeCode"
                    maxLength={6}
                    returnKeyType="go"
                    value={code}
                    onChangeText={(v) => {
                      setCode(v.replace(/\D/g, ""));
                      if (localCodeError) setLocalCodeError(null);
                      if (generalError) setGeneralError(null);
                    }}
                    onSubmitEditing={handleVerify}
                    error={codeError}
                    editable={!isFetching}
                  />

                  {globalError && (
                    <Text className="auth-error">{globalError}</Text>
                  )}

                  <AuthButton
                    label="Verify and continue"
                    onPress={handleVerify}
                    loading={isFetching}
                    disabled={code.length < 6 || isFetching}
                  />

                  <AuthButton
                    label="Send a new code"
                    onPress={handleResend}
                    disabled={isFetching}
                    variant="secondary"
                  />

                  <Pressable
                    hitSlop={8}
                    onPress={handleStartOver}
                    disabled={isFetching}
                    className="items-center pt-1"
                  >
                    <Text className="auth-link">Use a different email</Text>
                  </Pressable>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
