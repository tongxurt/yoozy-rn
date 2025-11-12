import {View} from "react-native";
import {useLocalSearchParams} from "expo-router";
import useTailwindVars from "@/hooks/useTailwindVars";

const Inspiration = () => {
    const {id} = useLocalSearchParams();

    const {colors} = useTailwindVars()



    return (
        <View>
            {JSON.stringify(id)}
        </View>
    )
}

export default Inspiration
