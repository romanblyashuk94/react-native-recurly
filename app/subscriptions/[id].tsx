import { Link, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { usePostHog } from "posthog-react-native";

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture("subscription_details_viewed", {
      subscription_id: id,
    });
  }, [id, posthog]);

  return (
    <View>
      <Text>SubscriptionDetails {id}</Text>
      <Link href="/(tabs)/subscriptions">Go Back to Subscriptions</Link>
    </View>
  );
};

export default SubscriptionDetails;
