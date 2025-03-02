
import { useEffect, useState } from "react"
import { StyleSheet, View, ScrollView, Text, TouchableOpacity, ToastAndroid, Alert, RefreshControl } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import NepaliDate from "nepali-date-converter";
import AD2BS from "nepali-date-converter";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase.config";
import ReportCardSkeleton from "@/components/report-card-skeleton";
import AntDesign from '@expo/vector-icons/AntDesign';
import { firestoreService } from "@/utils/firebase";

const todayBS = new NepaliDate();
const currentYear = todayBS.getYear();
const currentMonth = todayBS.getMonth();
const currentDay = todayBS.getDay();


let startOfWeekBS = new NepaliDate(
  currentYear,
  currentMonth,
  todayBS.getDate() - currentDay
);

let endOfWeekBS = new NepaliDate(
  currentYear,
  currentMonth,
  todayBS.getDate() + (6 - currentDay)
);

export const startOfWeekStr = startOfWeekBS.format("YYYY-MM-DD");
export const endOfWeekStr = endOfWeekBS.format("YYYY-MM-DD");

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState<
    { date: string; income: number; expenses: number; savings: number, expensesHeading: string, cashIncome: number, creditIncome: number, onlineIncome: number }[]
  >([]);
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    const hours = new Date().getHours()
    if (hours < 12) {
      setGreeting("शुभ बिहानी")
    } else if (hours >= 12 && hours < 17) {
      setGreeting("शुभ दिउँसो")
    } else {
      setGreeting("शुभ रात्रि")
    }


  }, []);


  const fetchNepaliWeeklyData = async () => {
    try {
      setIsLoading(true);
  
      const fetchCollectionData = async (collectionName: string) => {
        const q = query(
          collection(db, collectionName),
          where("createdAt", ">=", startOfWeekStr),
          where("createdAt", "<=", endOfWeekStr)
        );
  
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => {
          const data = doc.data();
  
          const cashIncome = parseInt(data.cash_income || "0", 10);
          const creditIncome = parseInt(data.credit_income || "0", 10);
          const onlineIncome = parseInt(data.online_income || "0", 10);
  
          return {
            createdAt: data.createdAt,
            cashIncome: collectionName === "incomes" ? cashIncome : 0,
            creditIncome: collectionName === "incomes" ? creditIncome : 0,
            onlineIncome: collectionName === "incomes" ? onlineIncome : 0,
            expensesHeading: collectionName === "expenses" ? data?.heading : "",
            amount:
              collectionName === "incomes"
                ? cashIncome + creditIncome + onlineIncome
                : parseInt(data.amount || "0", 10),
          };
        });
      };
  
      const [incomes, savings, expenses] = await Promise.all([
        fetchCollectionData("incomes"),
        fetchCollectionData("savings"),
        fetchCollectionData("expenses"),
      ]);
  
      const groupedData: Record<
        string,
        {
          income: number;
          cashIncome: number;
          creditIncome: number;
          onlineIncome: number;
          savings: number;
          expenses: number;
          expensesHeading: string;
        }
      > = {};
  
      const addToGroup = (
        data: any[],
        type: "income" | "savings" | "expenses"
      ) => {
        data.forEach((item) => {
          const date = item.createdAt;
          if (!groupedData[date]) {
            groupedData[date] = {
              income: 0,
              cashIncome: 0,
              creditIncome: 0,
              onlineIncome: 0,
              savings: 0,
              expenses: 0,
              expensesHeading: "",
            };
          }
          if (type === "income") {
            groupedData[date].cashIncome += item.cashIncome;
            groupedData[date].creditIncome += item.creditIncome;
            groupedData[date].onlineIncome += item.onlineIncome;
          }
          groupedData[date][type] += item.amount;
          groupedData[date].expensesHeading = item.expensesHeading;
        });
      };
  
      addToGroup(incomes, "income");
      addToGroup(savings, "savings");
      addToGroup(expenses, "expenses");
  
      const formattedReports = Object.keys(groupedData).map((date) => ({
        date,
        ...groupedData[date],
      }));
  
      formattedReports.sort((a, b) => (a.date > b.date ? 1 : -1));
  
      setReports(formattedReports);
      setRefreshing(false);
      setIsLoading(false);
    } catch (error) {
      setRefreshing(false);
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchNepaliWeeklyData();
  }, []);


  const handleDeleteReport = async (report: any) => {

    Alert.alert("रिपोर्ट हटाउनि हो", "रिपोर्ट हटाउनि हो भने तपिको आम्दानी कम हुने छ|", [
      {
        text: "होइन जुक्कियर, बन्द गर्छु",
        style: "destructive",
      },
      {
        text: "हटाउनु छ",
        onPress: async () => {
          try {

            await firestoreService.deleteByDate(["incomes", "savings", "expenses"], report.date);
            ToastAndroid.show("रिपोर्ट सफतापुर्बक हट्यो", ToastAndroid.SHORT);
            setReports(reports.filter((item) => item.date !== report.date));
          } catch (error) {
            ToastAndroid.show("रिपोर्ट हट्न सकेन, फेरी कोसिस गर्नुस।", ToastAndroid.SHORT);
          }
        },
      },
    ]);
  }

  const todayBS = new AD2BS(new Date());
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FFD700", "#FFA500"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <View style={styles.headerContainer}>
          <Text style={{ fontSize: 20, color: "#fff" }}>{todayBS.format("YYYY-MM-DD")}</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={styles.welcomeText}>हेल्लो 👋</Text>

          </View>
          <Text style={styles.welcomeText}>क्रर्न्ची चिप्स</Text>
        </View>
      </LinearGradient>

      <View style={styles.reportsContainer}>
        <Text style={styles.reportsTitle}>साप्ताहिक वित्तीय विवरण</Text>
        <Text style={styles.dateText}>{startOfWeekStr}  देखि  {endOfWeekStr}</Text>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchNepaliWeeklyData} />
        }>
          {
            isLoading && Array(7).fill(null).map((_, index) => (
              <ReportCardSkeleton key={index} />
            ))
          }
          {!isLoading && reports?.length === 0 && (
            <View>
              <Text style={{ textAlign: "center", fontSize: 20, color: "#E74C3C" }}>यो हप्ताको छैन  </Text>
            </View>
          )}
          {!isLoading && reports?.map((report, index) => {
            return(
              (
                <View key={index} style={styles.reportCard}>
                  <Text style={styles.reportDate}>मिति: {report?.date}</Text>
                  <View style={styles.reportRow}>
                    <View style={styles.reportItem}>
                      <Text style={styles.reportLabel}>आम्दानी</Text>
                      
                      <View style={{ flexDirection: "column", alignItems: "flex-start", borderBottomWidth: 1, borderBottomColor: "#ccc", padding:2 }}>
                        <Text>नगद रु.{report?.cashIncome}</Text>
                        <Text>उधारो रु.{report?.creditIncome}</Text>
                        <Text>अनलाइन रु.{report?.onlineIncome}</Text>
                      </View>
                      <Text style={styles.reportValue}>जम्मा रु.{report?.income}</Text>
                    </View>
                    <View style={styles.reportItem}>
                      <Text style={styles.reportLabel}>खर्च</Text>
                      <Text style={styles.expensesValue}>रु.{report?.expenses}</Text>
                      <Text style={{}}>{report?.expensesHeading}</Text>
                    </View>
                    <View style={styles.reportItem}>
                      <Text style={styles.reportLabel}>बचत</Text>
                      <Text
                        style={[styles.reportValue, styles.savingsValue]}
                      >
                        रु. {report.savings}
                      </Text>
                    </View>
                    <View style={styles.editButtonContainer}>
                      <TouchableOpacity onPress={() => handleDeleteReport(report)} activeOpacity={0.8}>
                        <AntDesign name="delete" size={24} color="#E74C3C" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )
            )
          })}
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  background: {
    height: 250,
    width: "100%",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  headerContainer: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  greetingText: {
    fontSize: 28,
    color: "#fff",

    fontWeight: "500",
  },
  editButtonContainer: {
    marginLeft: 10,
  },
  reportsContainer: {
    position: "absolute",
    top: 180,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  reportsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  dateText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  scrollView: {
    flex: 1,
    padding: 10,
  },
  reportCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  reportDate: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#444",
  },
  reportRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reportItem: {
    flex: 1,
    alignItems: "center",
  },
  reportLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 5,
  },
  reportValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  expensesValue: {
    color: "#E74C3C",
    fontWeight: "600",
    fontSize: 16,
  },
  savingsValue: {
    color: "#27AE60",
  },
})

