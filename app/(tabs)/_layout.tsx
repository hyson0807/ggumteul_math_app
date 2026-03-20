import { View, Text } from "react-native";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";

export default function TabsLayout() {
  return (
    <SafeAreaView className="flex-1 bg-[#FFE2DE]" edges={["top"]}>
      {/* 수학마을 타이틀 - 흰색 컨테이너 위 */}
      <View className="px-6 pt-4 pb-3">
        <Text className="text-xl font-bold text-[#8B6914] text-center">수학마을</Text>
      </View>

      <View className="flex-1 mx-4 mb-4 rounded-3xl bg-white overflow-hidden border border-[#F0D5C8]">
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors.tabBarActive,
            tabBarInactiveTintColor: Colors.tabBarInactive,
            tabBarStyle: {
              backgroundColor: "#FFF8F0",
              borderTopWidth: 1,
              borderTopColor: "#F0D5C8",
              height: 72,
              paddingBottom: 12,
              paddingTop: 8,
            },
            headerShown: false,
            sceneStyle: { backgroundColor: "transparent" },
          }}
        >
          <Tabs.Screen
            name="village"
            options={{
              title: "마을",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="home-variant" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="math"
            options={{
              title: "수학문제",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="pencil-ruler" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="bag"
            options={{
              title: "내 가방",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="bag-personal" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "프로필",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="account-circle" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </View>
    </SafeAreaView>
  );
}
