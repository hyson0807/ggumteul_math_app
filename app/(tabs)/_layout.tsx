import { View } from "react-native";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LiquidGlassTabBar } from "@/components/navigation/LiquidGlassTabBar";
import { WormTabIcon } from "@/components/navigation/WormTabIcon";

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
            name="home"
            options={{
              title: "홈",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="sprout" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="shop"
            options={{
              title: "상점",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="storefront-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "프로필",
              tabBarIcon: ({ focused }) => <WormTabIcon focused={focused} />,
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}
