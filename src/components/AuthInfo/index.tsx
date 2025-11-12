import {useAuthUser} from "@/hooks/useAuthUser";
import LatterAvatar from "@/components/LatterAvatar";
import {TouchableOpacity} from "react-native";
import {router} from "expo-router";


const AuthInfo = () => {

    const {user} = useAuthUser({fetchImmediately: true})

    if (user) {
        return (
            <TouchableOpacity activeOpacity={0.9} onPress={() => router.push("/settings")}>
                <LatterAvatar  size={30} name={user._id!} />
            </TouchableOpacity>
        )
    }

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={() => router.push("/")}>

        </TouchableOpacity>
    )
}

export default AuthInfo
