import ScreenContainer from "@/components/ScreenContainer";
import CommodityList from "../commodity/list";


const CommodityListScreen = () => {

    return <ScreenContainer edges={['top']} >
        <CommodityList />
    </ScreenContainer>
}

export default CommodityListScreen;
