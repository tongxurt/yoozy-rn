import ScreenContainer from "@/components/ScreenContainer";
import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";


const AssetDetail = () => {
    const { id } = useLocalSearchParams<{ id: string }>();

    return (
        <ScreenContainer>
            <Text>Asset Detail</Text>
        </ScreenContainer>
    );
};

export default AssetDetail;