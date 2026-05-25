import { colors } from "@/constants/theme";
import clsx from "clsx";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  Text,
  View,
} from "react-native";

type AuthButtonProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  loading?: boolean;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
};

const AuthButton = ({
  label,
  loading = false,
  variant = "primary",
  disabled,
  fullWidth = true,
  ...rest
}: AuthButtonProps) => {
  const isDisabled = disabled || loading;
  const isSecondary = variant === "secondary";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      android_ripple={{ color: "rgba(8,17,38,0.08)" }}
      {...rest}
      style={({ pressed }) => [
        { opacity: pressed && !isDisabled ? 0.85 : 1 },
        fullWidth ? { width: "100%" } : null,
      ]}
    >
      <View
        className={clsx(
          isSecondary ? "auth-secondary-button" : "auth-button",
          isDisabled && !isSecondary && "auth-button-disabled",
        )}
      >
        {loading ? (
          <ActivityIndicator
            color={isSecondary ? colors.accent : colors.primary}
          />
        ) : (
          <Text
            className={
              isSecondary ? "auth-secondary-button-text" : "auth-button-text"
            }
          >
            {label}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

export default AuthButton;
