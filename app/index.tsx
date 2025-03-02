import { Redirect } from "expo-router";
import { Text, View } from "react-native";

const Page = ()=>{
    return(
        <Redirect href="/(tabs)/home"/>
    )
}

export default Page;