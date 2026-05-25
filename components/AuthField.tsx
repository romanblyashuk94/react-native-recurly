import clsx from "clsx";
import { forwardRef, useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

type AuthFieldProps = TextInputProps & {
  label: string;
  error?: string | null;
  hint?: string;
  isPassword?: boolean;
  containerClassName?: string;
};

const AuthField = forwardRef<TextInput, AuthFieldProps>(
  (
    {
      label,
      error,
      hint,
      isPassword = false,
      containerClassName,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const hasError = Boolean(error);

    return (
      <View className={clsx("auth-field", containerClassName)}>
        <Text className="auth-label">{label}</Text>

        <View className="relative">
          <TextInput
            ref={ref}
            className={clsx(
              "auth-input",
              hasError && "auth-input-error",
              focused && !hasError && "border-accent",
              isPassword && "pr-16",
            )}
            placeholderTextColor="rgba(0,0,0,0.4)"
            secureTextEntry={isPassword && !showPassword}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...rest}
          />

          {isPassword && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? "Hide password" : "Show password"
              }
              hitSlop={8}
              onPress={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-0 h-full justify-center px-2"
            >
              <Text className="text-xs font-sans-bold uppercase tracking-[1px] text-accent">
                {showPassword ? "Hide" : "Show"}
              </Text>
            </Pressable>
          )}
        </View>

        {hasError ? (
          <Text className="auth-error">{error}</Text>
        ) : hint ? (
          <Text className="auth-helper">{hint}</Text>
        ) : null}
      </View>
    );
  },
);

AuthField.displayName = "AuthField";

export default AuthField;
