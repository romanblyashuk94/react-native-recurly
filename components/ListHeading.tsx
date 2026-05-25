import { Text, TouchableOpacity, View } from "react-native";

interface ListHeadingProps {
  title: string;
  onPressViewAll?: () => void;
}

const ListHeading = ({ title, onPressViewAll }: ListHeadingProps) => {
  return (
    <View className="list-head">
      <Text className="list-title">{title}</Text>

      <TouchableOpacity
        className="list-action"
        onPress={onPressViewAll}
        accessibilityRole="button"
        accessibilityLabel={`View all ${title}`}
        disabled={!onPressViewAll}
      >
        <Text className="list-action-text">View all</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ListHeading;
