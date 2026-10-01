import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { NavigationBar } from 'expo-navigation-bar';
import VideoPlayerScreen from './screens/VideoPlayerScreen';
import HomeScreen from './screens/HomeScreen';

type RootStackParamList = {
	Home: undefined;
	VideoPlayer: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
	return (
		<NavigationContainer>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				<Stack.Screen name="Home" component={HomeScreen} />
				<Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
			</Stack.Navigator>

			<StatusBar style="light" />
			<NavigationBar style="light" />
		</NavigationContainer>
	);
}