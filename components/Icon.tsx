import { StyleProp, TextStyle } from 'react-native';
import MaterialIcons from "@expo/vector-icons/FontAwesome6";

const Icon = ({ name = "play", size = 20, color = "white", style = {}, solid = false }: { name?: string, size?: number, color?: string, style?: StyleProp<TextStyle>, solid?: boolean }) => {
    return (
        <MaterialIcons
            name={name}
            size={size}
            color={color}
            style={style}
            solid={solid}
        />
    )
}

export default Icon