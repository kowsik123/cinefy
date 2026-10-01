import { useState } from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

const Button = ({ title, onPress, loading = false }: { title: string, onPress: () => void, loading?: boolean }) => {
    const [pressed, setPressed] = useState(false);
    return <Pressable onPress={onPress} onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)} style={{ width: "100%", height: 40, backgroundColor: pressed ? "#ebebeb" : "#ffffff", justifyContent: "center", alignItems: "center", elevation: pressed ? 0 : 4, borderRadius: 40 }}>
        {loading ? (
            <ActivityIndicator color={"black"} />
        ) : (
            <Text style={{ color: "black", fontSize: 16 }}>{title}</Text>
        )}
    </Pressable>
}

export default Button;