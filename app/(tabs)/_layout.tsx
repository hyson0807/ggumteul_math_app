import { View } from "react-native";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LiquidGlassTabBar } from "@/components/navigation/LiquidGlassTabBar";

export default function TabsLayout() {
  return (
    <View className="flex-1 bg-[#FFE2DE]">
      <View className="flex-1">
        <Tabs
          tabBar={(props) => <LiquidGlassTabBar {...props} />}
          screenOptions={{
            headerShown: false,
            sceneStyle: { backgroundColor: "transparent" },
            tabBarStyle: {
              position: "absolute",
              borderTopWidth: 0,
              backgroundColor: "transparent",
            },
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
    </View>
  );
}
