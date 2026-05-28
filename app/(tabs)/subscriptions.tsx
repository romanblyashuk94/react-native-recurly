import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  KeyboardAvoidingView as RNKeyboardAvoidingView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);
const KeyboardAvoidingView = styled(RNKeyboardAvoidingView);

const Subscriptions = () => {
  const { subscriptions } = useSubscriptions();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  const filteredSubscriptions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) return subscriptions;

    return subscriptions.filter((subscription) =>
      [
        subscription.name,
        subscription.category,
        subscription.plan,
        subscription.billing,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedQuery)),
    );
  }, [searchQuery, subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Text className="text-2xl font-sans-bold text-black">
          Subscriptions
        </Text>
        <Text className="mt-2 text-base font-sans text-black/60">
          Browse and search your active plans.
        </Text>

        <View className="mt-4">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name, category, or plan"
            placeholderTextColor="rgba(0,0,0,0.4)"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 font-sans text-black/60"
          />
        </View>

        <FlatList
          data={filteredSubscriptions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              expanded={expandedSubscriptionId === item.id}
              onPress={() =>
                setExpandedSubscriptionId((prev) =>
                  prev === item.id ? null : item.id,
                )
              }
            />
          )}
          extraData={expandedSubscriptionId}
          ItemSeparatorComponent={() => <View className="h-4" />}
          ListEmptyComponent={() => (
            <Text className="mt-8 text-center font-sans text-base text-black/60">
              No subscriptions match your search.
            </Text>
          )}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerClassName="pt-5 pb-28"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Subscriptions;
