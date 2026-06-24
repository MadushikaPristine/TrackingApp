import React from 'react';
import {StatusBar} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import RepListScreen from './src/screens/RepListScreen';
import RouteMapScreen from './src/screens/RouteMapScreen';
import {RootStackParamList} from './src/types';
import {COLORS} from './src/constants/colors';

const Stack = createStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: {backgroundColor: COLORS.primary},
              headerTintColor: COLORS.surface,
              headerTitleStyle: {fontWeight: '700', fontSize: 18},
            }}>
            <Stack.Screen
              name="RepList"
              component={RepListScreen}
              options={{title: 'Sales Team'}}
            />
            <Stack.Screen
              name="RouteMap"
              component={RouteMapScreen}
              options={({route}) => ({title: route.params.repName})}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
