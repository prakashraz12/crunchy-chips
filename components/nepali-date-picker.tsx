import React from "react";
import { View} from "react-native";
import {
    CalendarPicker,
} from 'react-native-nepali-picker';

interface NepaliDatePickerProps {
    onDateChange: (date: string) => void;
    initialDate: string;
    visible?: boolean;
    onClose?: () => void;
}

const NepaliDatePicker: React.FC<NepaliDatePickerProps> = ({
    onDateChange,
    initialDate,
    visible,
    onClose,
}) => {

    const onDateSelect = (PickedDate: string) => {
        onDateChange(PickedDate);
    };

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <CalendarPicker
                initialDate={initialDate}
                visible={visible}
                onClose={onClose}
                onDateSelect={onDateSelect}
                language="np"
                
            />
        </View>
    );
};

export default NepaliDatePicker;
