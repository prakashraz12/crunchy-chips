import NepaliDatePicker from '@/components/nepali-date-picker';
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { endOfWeekStr, startOfWeekStr } from './home.screen';


const DateRangePickerComponent = ({ setDateRange, dateRange }: any) => {

    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [isFromDate, setIsFromDate] = useState(false); // State to track whether 'from' or 'to' is being selected

    const handleDateChange = (selectedDate: string) => {
        if (isFromDate) {
            setDateRange({ ...dateRange, start: selectedDate });
        } else {
            setDateRange({ ...dateRange, end: selectedDate });
        }
    };

    return (
        <View style={styles.periodSelector}>
            <TouchableOpacity
                style={styles.periodButton}
                onPress={() => {
                    setIsFromDate(true);
                    setIsDatePickerOpen(true);
                }}
            >
                <Text style={styles.periodText}>
                    {dateRange.start || 'Select From Date'}
                </Text>
            </TouchableOpacity>
            <Text>-</Text>
            <TouchableOpacity
                style={styles.periodButton}
                onPress={() => {
                    setIsFromDate(false);
                    setIsDatePickerOpen(true);
                }}
            >
                <Text style={styles.periodText}>
                    {dateRange.end || 'Select To Date'}
                </Text>
            </TouchableOpacity>

            <NepaliDatePicker
                initialDate={isFromDate ? dateRange.start : dateRange.end}
                onDateChange={handleDateChange}
                visible={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    periodSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        margin: 10,
        alignItems: 'center',
    },
    periodButton: {
        padding: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
    },
    periodText: {
        fontSize: 16,
        color: '#333',
    },
});

export default DateRangePickerComponent;
