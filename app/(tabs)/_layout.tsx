import { Tabs } from "expo-router"
import { router } from "expo-router"
import { Platform, View, TouchableOpacity, StyleSheet, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';

const { width } = Dimensions.get("window")

const ICON_SIZE = 24
const ACTIVE_COLOR = "#FFA500" // Orange
const INACTIVE_COLOR = "#757575" // Gray

export default function TabLayout() {
  const handleAddPress = () => {
    router.push("/(routes)/add/page")
  }

  return (
    <>
      {/* Floating Add Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPress} activeOpacity={0.8}>
          <Ionicons name="add" size={ICON_SIZE + 8} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: ACTIVE_COLOR,
          tabBarInactiveTintColor: INACTIVE_COLOR,
          headerShown: false,
          tabBarStyle: {
            ...Platform.select({
              ios: {
                position: "absolute",
              },
              default: {},
            }),
            height: 60, // Increase height to accommodate the floating button
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "होम",
            tabBarIcon: ({ color }) => <AntDesign name="home" size={24} color={color} />,
          }}
        />

        {/* Empty middle tab for the add button space */}
        <Tabs.Screen
          name="add"
          options={{
            title: "",
            tabBarButton: () => <View style={{ width: width / 3 }} />,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault()
            },
          }}
        />

        <Tabs.Screen
          name="report"
          options={{
            title: "रिपोर्ट",
            tabBarIcon: ({ color }) => <Entypo name="bar-graph" size={24} color={color} />,
          }}
        />
      </Tabs>
    </>
  )
}

const styles = StyleSheet.create({
  addButtonContainer: {
    position: "absolute",
    bottom: 30, // Position it above the tab bar
    alignSelf: "center",
    zIndex: 999, // Ensure it's above other elements
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ACTIVE_COLOR,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
})

