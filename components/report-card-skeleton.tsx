
import { useEffect, useRef } from "react"
import { View, StyleSheet, Animated } from "react-native"

const ReportCardSkeleton = () => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [fadeAnim])

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.date, { opacity: fadeAnim }]} />
      <View style={styles.row}>
        <View style={styles.column}>
          <Animated.View style={[styles.label, { opacity: fadeAnim }]} />
          <Animated.View style={[styles.value, { opacity: fadeAnim }]} />
        </View>
        <View style={styles.column}>
          <Animated.View style={[styles.label, { opacity: fadeAnim }]} />
          <Animated.View style={[styles.value, { opacity: fadeAnim }]} />
        </View>
        <View style={styles.column}>
          <Animated.View style={[styles.label, { opacity: fadeAnim }]} />
          <Animated.View style={[styles.value, { opacity: fadeAnim }]} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",

  },
  date: {
    height: 20,
    width: "40%",
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    width: "30%",
  },
  label: {
    height: 14,
    width: "80%",
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 5,
  },
  value: {
    height: 18,
    width: "100%",
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
  },
})

export default ReportCardSkeleton

