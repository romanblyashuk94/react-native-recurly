import { Link, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams();

  return (
    <View>
      <Text>SubscriptionDetails {id}</Text>
      <Link href="/(tabs)/subscriptions">Go Back to Subscriptions</Link>
    </View>
  );
};

export default SubscriptionDetails;
