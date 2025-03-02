import AD2BS from "nepali-date-converter";
import {  useMemo, useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ToastAndroid, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { firestoreService } from "@/utils/firebase"
import { serverTimestamp } from "firebase/firestore";
import { router } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import NepaliDatePicker from "@/components/nepali-date-picker";


const ACTIVE_COLOR = "#FFA500"
const INACTIVE_COLOR = "#757575"

type TabType = "आम्दानी" | "खर्च" | "बचत"

const todaysNepaliDate = new AD2BS(new Date()).format('YYYY-MM-DD');

export default function AddScreen() {
    const [date, setDate] = useState(todaysNepaliDate);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<TabType>("आम्दानी")

    // Income state
    const [cashIncome, setCashIncome] = useState("")
    const [creditIncome, setCreditIncome] = useState("")
    const [onlineIncome, setOnlineIncome] = useState("")

    // Expenses state
    const [expenseAmount, setExpenseAmount] = useState("")
    const [expenseHeading, setExpenseHeading] = useState("")

    // Savings state
    const [savingsAmount, setSavingsAmount] = useState("")



    const createIncome = async () => {
        try {
            if (!cashIncome && !creditIncome && !onlineIncome) {
                ToastAndroid.show("कृपया आम्दानी राख्नुहोस्", ToastAndroid.SHORT);
                return;
            }
            setIsLoading(true)

            await firestoreService.create("incomes", {
                name: "Income",
                cash_income: cashIncome,
                credit_income: creditIncome,
                online_income: onlineIncome,
                createdAt: date,

                timestamp: serverTimestamp(),

            })

            ToastAndroid.show("खातामा दर्ता  भयो है।", ToastAndroid.SHORT);
            router.replace("/(tabs)/home");
            setIsLoading(false)
            setCashIncome("")
            setCreditIncome("")
            setOnlineIncome("")
        } catch (error) {
            ToastAndroid.show("ला। भएन फेरी गर्नु त।", ToastAndroid.SHORT)
            setIsLoading(false)
        }
    }

    const createExpense = async () => {
        try {
            if (!expenseAmount || !expenseHeading) {
                ToastAndroid.show("खर्च भएको रकम र खर्च श्रीषक लेख्नु त ", ToastAndroid.SHORT)
                return
            }
            setIsLoading(true)
            await firestoreService.create("expenses", {
                name: "Expense",
                amount: expenseAmount,
                heading: expenseHeading,
                createdAt: date,
                timestamp: serverTimestamp(),
            })
            ToastAndroid.show("खर्च दर्ता भयो है", ToastAndroid.SHORT)
            setIsLoading(false)
            router.replace("/(tabs)/home");
            setExpenseAmount("")
            setExpenseHeading("")
        } catch (error) {
            ToastAndroid.show("खर्च दर्ता हुन सकेन है , फेरी गर्नुस", ToastAndroid.SHORT)
            setIsLoading(false)
        }

    }

    const createSavings = async () => {
        try {
            if (!savingsAmount) {
                ToastAndroid.show("कृपया खाता रकम दर्ज गर्नु त।", ToastAndroid.SHORT)
                return
            }
            setIsLoading(true)
            await firestoreService.create("savings", {
                name: "Savings",
                amount: savingsAmount,
                createdAt: date,
                timestamp: serverTimestamp(),
            })
            ToastAndroid.show("बचत दर्ता  भयो है", ToastAndroid.SHORT)
            setIsLoading(false)
            router.replace("/(tabs)/home");
            setSavingsAmount("")
        } catch (error) {
            ToastAndroid.show("बचत दर्ता हुन सकेन है , फेरी गर्नुस", ToastAndroid.SHORT)
            setIsLoading(false)
        }
    }
    const totalIncome = useMemo(() => {
        const cash = parseInt(cashIncome, 10) || 0;
        const credit = parseInt(creditIncome, 10) || 0;
        const online = parseInt(onlineIncome, 10) || 0;
        return cash + credit + online;
    }, [cashIncome, creditIncome, onlineIncome]);

    const AddItemScreen = () => {
        switch (activeTab) {
            case "आम्दानी":
                return (
                    <View style={styles.tabContent}>
                        <TextInput
                            style={styles.input}
                            placeholder="नगद आम्दानी"
                            value={cashIncome}
                            onChangeText={setCashIncome}
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="उधारो लागेको"
                            value={creditIncome}
                            onChangeText={setCreditIncome}
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="इ-सेवा तथा अनलाइन बैंकिङ बाट प्राप्त रकम|"
                            value={onlineIncome}
                            onChangeText={setOnlineIncome}
                            keyboardType="numeric"
                        />
                        <Text style={styles.totalText}>
                            जम्मा: रु.{totalIncome}
                        </Text>
                        <TouchableOpacity disabled={isLoading} style={styles.saveButton} onPress={() => createIncome()} >
                            {isLoading ? (
                                <ActivityIndicator
                                    size="small"
                                    color="#FFFFFF"
                                    animating={true}
                                />
                            ) : (
                                <Text style={styles.saveButtonText}>सेब</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )
            case "खर्च":
                return (
                    <View style={styles.tabContent}>
                        <TextInput
                            style={styles.input}
                            placeholder="खर्च रकम"
                            value={expenseAmount}
                            onChangeText={setExpenseAmount}
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="खर्च श्रीषक"
                            value={expenseHeading}
                            onChangeText={setExpenseHeading}
                        />
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.expenseTypeButton} onPress={() => setExpenseHeading("सबै खर्च गरेर")}>
                                <Text style={styles.expenseTypeButtonText}>सबै खर्च गरेर</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.expenseTypeButton} onPress={() => setExpenseHeading("चिप्स हरु लाएको")}>
                                <Text style={styles.expenseTypeButtonText}>चिप्स हरु लाएको</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.expenseTypeButton} onPress={() => setExpenseHeading("अन्य खर्च")}>
                                <Text style={styles.expenseTypeButtonText}>अन्य खर्च</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.saveButton} onPress={() => createExpense()} disabled={isLoading}>
                            {isLoading ? (
                                <ActivityIndicator
                                    size="small"
                                    color="#FFFFFF"
                                    animating={true}
                                />
                            ) : (
                                <Text style={styles.saveButtonText}>सेब</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )
            case "बचत":
                return (
                    <View style={styles.tabContent}>
                        <TextInput
                            style={styles.input}
                            placeholder="बचत रकम"
                            value={savingsAmount}
                            onChangeText={setSavingsAmount}
                            keyboardType="numeric"
                        />
                        <TouchableOpacity style={styles.saveButton} disabled={isLoading} onPress={() => createSavings()}>
                            {isLoading ? (
                                <ActivityIndicator
                                    size="small"
                                    color="#FFFFFF"
                                    animating={true}
                                />
                            ) : (
                                <Text style={styles.saveButtonText}>सेब</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )
        }
    }


    return (
        <ScrollView style={styles.container}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <TouchableOpacity onPress={() => router.back()}>
                    <AntDesign name="arrowleft" size={30} color="black" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsDatePickerOpen(true)}>
                    <Text style={styles.dateText}>आज मिति: {date}</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.tabContainer}>
                {(["आम्दानी", "खर्च", "बचत"] as TabType[])?.map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        disabled={isLoading}
                        style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Ionicons
                            name={tab === "आम्दानी" ? "cash" : tab === "खर्च" ? "cart" : "save"}
                            size={24}
                            color={activeTab === tab ? ACTIVE_COLOR : INACTIVE_COLOR}
                        />
                        <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            {AddItemScreen()}
            <NepaliDatePicker initialDate={date} visible={isDatePickerOpen} onClose={() => setIsDatePickerOpen(false)} onDateChange={(date) => setDate(date)} />

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20,
    },
    dateText: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    tabContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 20,
    },
    tabButton: {
        alignItems: "center",
        padding: 10,
    },
    activeTabButton: {
        borderBottomWidth: 2,
        borderBottomColor: ACTIVE_COLOR,
    },
    tabButtonText: {
        color: INACTIVE_COLOR,
        marginTop: 5,
    },
    activeTabButtonText: {
        color: ACTIVE_COLOR,
    },
    tabContent: {
        marginTop: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        fontSize: 16,
    },
    totalText: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
    },
    saveButton: {
        backgroundColor: ACTIVE_COLOR,
        padding: 20,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    expenseTypeButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: ACTIVE_COLOR,
        borderStyle: "dashed",
        borderRadius: 5,
        padding: 10,
        marginHorizontal: 5,
        alignItems: "center",
    },
    expenseTypeButtonText: {
        color: ACTIVE_COLOR,
        fontSize: 16,
    },
})

