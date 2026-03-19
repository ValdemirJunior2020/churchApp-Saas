import React from "react";
import { View, Linking, TouchableOpacity, Text } from "react-native";

export default function LiveScreen({ route }) {
  const { youtubeUrl } = route.params;

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      
      <TouchableOpacity
        onPress={() => Linking.openURL(youtubeUrl)}
        style={{
          backgroundColor: "red",
          padding: 15,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "#fff" }}>
          Watch Live Stream
        </Text>
      </TouchableOpacity>

    </View>
  );
}