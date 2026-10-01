import { Pressable, Text } from "react-native";

const SeasonButton = ({ text, icon = "", onPress, active = false }: any) => {
    return <Pressable onPress={onPress} style={{ height: 30, backgroundColor: active ? "#00000083" : "#00000042", borderWidth: 1, borderColor: active ? "rgba(0, 0, 0, 0.127)" : "rgba(0, 0, 0, 0)", borderRadius: 30, flexDirection: "row", alignItems: "center", paddingLeft: 14, gap: 6, paddingRight: icon ? 0 : 14 }}>
        <Text style={{ color: "white", fontSize: 12, fontFamily: "InterRegular" }}>{text}</Text>
    </Pressable>
}

export default SeasonButton;