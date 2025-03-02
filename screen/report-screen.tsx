import { useState, useEffect, useCallback } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, ToastAndroid, Platform, RefreshControl } from "react-native"
import * as Print from "expo-print"
import * as FileSystem from "expo-file-system"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/firebase.config"
import { endOfWeekStr, startOfWeekStr } from "./home.screen"
import DateRangePickerComponent from "./date-range-pickers"
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import ReportCardSkeleton from "@/components/report-card-skeleton"
import { firestoreService } from "@/utils/firebase"
import * as MediaLibrary from "expo-media-library";

export default function ReportScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [isReportFetching, setIsReportFetching] = useState(false);
  const [reports, setReports] = useState<
    { date: string; income: number; expenses: number; savings: number, expensesHeading: string, cashIncome: number, creditIncome: number, onlineIncome: number }[]
  >([]);
  const [dateRange, setDateRange] = useState({
    start: startOfWeekStr,
    end: endOfWeekStr
  })

  const [isLoading, setIsLoading] = useState(false)

  const salesReport = useCallback(async () => {
    try {
      setIsReportFetching(true)
      const fetchCollectionData = async (collectionName: string) => {
        const q = query(
          collection(db, collectionName),
          where("createdAt", ">=", dateRange.start),
          where("createdAt", "<=", dateRange.end)
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

      setIsReportFetching(false)
      setRefreshing(false)
      setReports(formattedReports)

    } catch (error) {

      Alert.alert("Error", "Failed to fetch reports")
      setRefreshing(false)
      setIsReportFetching(false)
    }
  }, [dateRange, setDateRange])



  useEffect(() => {
    salesReport()
  }, [])

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



  
  const generatePDF = async () => {
    setIsLoading(true);
  
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow storage access to save the PDF.");
        setIsLoading(false);
        return;
      }
  
      const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica'; padding: 20px; }
            h1 { color: #333; font-size: 24px; }
            .report-card { 
              border: 1px solid #ddd; 
              border-radius: 8px; 
              padding: 15px; 
              margin-bottom: 15px; 
              background-color: #f9f9f9; 
            }
            .report-date { font-size: 16px; margin-bottom: 10px; font-weight: bold; }
            .report-row { display: flex; justify-content: space-between; }
            .report-item { text-align: center; width: 30%; }
            .report-label { font-size: 14px; color: #666; margin-bottom: 5px; }
            .report-value { font-size: 16px; font-weight: bold; }
            .expenses-value { color: #e53935; }
            .savings-value { color: #43a047; }
          </style>
        </head>
        <body>
          <h1>Financial Report - ${dateRange.start + " to " + dateRange.end}</h1>
          ${reports
            ?.map(
              (report) => `
            <div class="report-card">
              <div class="report-date">मिति: ${report.date}</div>
              <div class="report-row">
                <div class="report-item">
                  <div class="report-label">आम्दानी</div>
                  <div class="report-value">रु.${report.income}</div>
                  <p>नगद रु.${report.cashIncome}</p>
                  <p>उधारो रु.${report.creditIncome}</p>
                  <p>अनलाइन रु.${report.onlineIncome}</p>
                </div>
                <div class="report-item">
                  <div class="report-label">खर्च</div>
                  <div class="report-value expenses-value">रु.${report.expenses}</div>
                  <p>${report.expensesHeading}</p>
                </div>
                <div class="report-item">
                  <div class="report-label">बचत</div>
                  <div class="report-value savings-value">रु.${report.savings}</div>
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </body>
      </html>
    `;
  
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
  
      const fileName = `financial-report-${dateRange?.start}-${dateRange?.end}.pdf`;
      const downloadUri = `${FileSystem.documentDirectory}${fileName}`;
  
      await FileSystem.moveAsync({
        from: uri,
        to: downloadUri,
      });
  
      if (Platform.OS === "android") {
        const asset = await MediaLibrary.createAssetAsync(downloadUri);
        await MediaLibrary.createAlbumAsync("Download", asset, false);
        Alert.alert("सफलतापूर्वक डाउनलोड", "रिपोर्ट तयार भयो ,  मोबाइलमा हेर्नु होला");
      } else {
        Alert.alert("सफलतापूर्वक डाउनलोड", "रिपोर्ट तयार भयो ,  मोबाइलमा हेर्नु होला");
      }
  
    } catch (error) {
      Alert.alert("Error", "Failed to generate PDF");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={styles.title}>
            वित्तीय बिबरण
          </Text>
          <TouchableOpacity disabled={isLoading} onPress={() => generatePDF()}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFA500" />
            ) : (
              <FontAwesome5 name="arrow-circle-down" size={29} color="#FFA500" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <View style={styles.periodSelector}>
            <DateRangePickerComponent setDateRange={setDateRange} dateRange={dateRange} />
          </View>

          <TouchableOpacity onPress={() => { salesReport() }} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 9 }}>
            <AntDesign name="search1" size={20} color="black" />
            <Text style={{ fontSize: 19 }}>खोज्नु होस् </Text>
          </TouchableOpacity>

        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={salesReport} />}>
        {isReportFetching && Array(10).fill(0).map((_, index) => (
          <ReportCardSkeleton key={index} />
        ))}
        {!isReportFetching && reports?.length === 0 && (
          <Text style={{ textAlign: "center", marginTop: 20, fontSize: 18 }}>माफ गर्नु होस् , कुनै पनि रिपोर्ट फेला परेन </Text>
        )}
        {!isReportFetching && reports?.map((report, index) => (
          <View key={index} style={styles.reportCard}>
            <Text style={styles.reportDate}>मिति: {report?.date}</Text>
            <View style={styles.reportRow}>
              <View style={styles.reportItem}>
                <Text style={styles.reportLabel}>आम्दानी</Text>

                <View style={{ flexDirection: "column", alignItems: "flex-start", borderBottomWidth: 1, borderBottomColor: "#ccc", padding: 2 }}>
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
              <View >
                <TouchableOpacity onPress={() => handleDeleteReport(report)} activeOpacity={0.8}>
                  <AntDesign name="delete" size={24} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  periodSelector: {
    position: "relative",
    zIndex: 10,

  },
  periodButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 3,
  },
  periodText: {
    marginHorizontal: 8,
    fontSize: 14,
    color: "#333",
  },
  dropdown: {
    position: "absolute",
    top: 40,
    left: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "solid",
    width: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,

  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownText: {
    fontSize: 14,
    color: "#333",
  },
  activeText: {
    color: "#FFA500",
    fontWeight: "bold",
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFA500",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#fff",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    width: "31%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  chartContainer: {
    backgroundColor: "#fff",
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  label: {
    fontSize: 14,
    color: "#555",
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  savingsRow: {
    borderBottomWidth: 0,
  },
  savingsValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  reportCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reportDate: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  reportRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reportItem: {
    alignItems: "center",
    width: "30%",
  },
  reportLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  reportValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  expensesValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E53935",
  },
  savingsValue: {
    color: "#43A047",
  },
})

