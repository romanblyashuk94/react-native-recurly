import React from "react";
import { Text, View } from "react-native";

type AuthBrandProps = {
  align?: "row" | "center";
};

const AuthBrand = ({ align = "row" }: AuthBrandProps) => {
  if (align === "center") {
    return (
      <View className="items-center">
        <View className="auth-logo-mark mb-3">
          <Text className="auth-logo-mark-text">R</Text>
        </View>
        <Text className="auth-wordmark">Recurly</Text>
        <Text className="auth-wordmark-sub">SMART BILLING</Text>
      </View>
    );
  }

  return (
    <View className="auth-logo-wrap">
      <View className="auth-logo-mark">
        <Text className="auth-logo-mark-text">R</Text>
      </View>
      <View>
        <Text className="auth-wordmark">Recurly</Text>
        <Text className="auth-wordmark-sub">SMART BILLING</Text>
      </View>
    </View>
  );
};

export default AuthBrand;
