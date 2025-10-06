import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './screens/LoginScreen';
import SubmitTicket from './screens/SubmitTicket';
import MyTickets from './screens/MyTickets';
import AdminDashboard from './screens/AdminDashboard';
import TicketDetails from './screens/TicketDetails';

const Stack = createNativeStackNavigator(); 
const Tab = createBottomTabNavigator();

function UserTabs({ setRole }) {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Submit">
        {(props) => <SubmitTicket {...props} setRole={setRole} />}
      </Tab.Screen>
      <Tab.Screen name="My Tickets">
        {(props) => <MyTickets {...props} setRole={setRole} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function AdminTabs({ setRole }) {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard">
        {(props) => <AdminDashboard {...props} setRole={setRole} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const savedRole = await AsyncStorage.getItem('role');
        if (savedRole) setRole(savedRole);
      } catch (err) {
        console.error("Failed to load role from AsyncStorage:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, []);

  if (loading) return null; // Optional: you can render a splash screen here

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!role ? (
          <Stack.Screen name="Login"
            options={{ title: "Helpdesk" }} //  custom header title
          >
            {(props) => <LoginScreen {...props} setRole={setRole} />}
          </Stack.Screen>
        ) : role === 'user' ? (
          <Stack.Screen name="User" options={{ headerShown: false }}>
            {(props) => <UserTabs {...props} setRole={setRole} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Admin" options={{ headerShown: false }}>
            {(props) => <AdminTabs {...props} setRole={setRole} />}
          </Stack.Screen>
        )}
        <Stack.Screen
          name="TicketDetails"
          component={TicketDetails}
          options={{ title: 'Ticket Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
