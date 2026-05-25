import { formatCurrency } from "@/lib/utils";
import React from "react";
import { Image, Text, View } from "react-native";

interface UpcomingSubscriptionCardProps {
  data: UpcomingSubscription;
}

const UpcomingSubscriptionCard = ({
  data: { icon, name, price, currency, daysLeft },
}: UpcomingSubscriptionCardProps) => {
  return (
    <View className="upcoming-card">
      <View className="upcoming-row">
        <Image source={icon} className="upcoming-icon" />
        <View>
          <Text className="upcoming-price">
            {formatCurrency(price, currency)}
          </Text>
          <Text className="upcoming-meta" numberOfLines={1}>
            {daysLeft <= 0
              ? "Expired"
              : daysLeft === 1
                ? "Last day"
                : `${daysLeft} days left`}
          </Text>
        </View>
      </View>

      <Text className="upcoming-name">{name}</Text>
    </View>
  );
};

export default UpcomingSubscriptionCard;
