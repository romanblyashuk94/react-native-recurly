import AuthButton from "@/components/AuthButton";
import images from "@/constants/images";
import { useAuth, useClerk, useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const posthog = usePostHog();

  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      "Sign out",
      "You will need to sign in again to view your subscriptions.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: async () => {
            try {
              setSigningOut(true);
              posthog.capture("signed_out");
              posthog.reset();
              await signOut();
              router.replace("/(auth)/sign-in");
            } finally {
              setSigningOut(false);
            }
          },
        },
      ],
    );
  };

  const primaryEmail = user?.primaryEmailAddress?.emailAddress;
  const avatarSource = user?.imageUrl ? { uri: user.imageUrl } : images.avatar;
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const displayName =
    fullName || user?.username || primaryEmail || "Recurly member";
  const joinedDate = user?.createdAt
    ? dayjs(user.createdAt).format("DD. MM. YYYY.")
    : "—";

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="list-title mb-5">Settings</Text>

      <View className="settings-card">
        <View className="settings-user-row">
          <Image source={avatarSource} className="settings-avatar" />
          <View className="min-w-0 flex-1">
            <Text className="settings-user-name" numberOfLines={1}>
              {displayName}
            </Text>
            {primaryEmail && (
              <Text className="settings-user-email" numberOfLines={1}>
                {primaryEmail}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View className="settings-card">
        <Text className="settings-section-title">Account</Text>

        {user?.id && (
          <View className="settings-row">
            <Text className="settings-row-label">Account ID</Text>
            <Text className="settings-row-value" numberOfLines={1}>
              {user.id}
            </Text>
          </View>
        )}

        <View className="settings-row">
          <Text className="settings-row-label">Joined</Text>
          <Text className="settings-row-value">{joinedDate}</Text>
        </View>
      </View>

      {isSignedIn && (
        <View className="mt-6">
          <AuthButton
            label="Sign Out"
            loading={signingOut}
            onPress={handleSignOut}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default Settings;
