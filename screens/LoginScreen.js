import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config'; // make sure you have this file

export default function LoginScreen({ setRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) throw new Error("Network response not ok");

      const data = await res.json();
      if (data.role) {
        setRole(data.role);
        await AsyncStorage.setItem("role", data.role);
      } else {
        Alert.alert("Error", "Invalid credentials");
      }
    } catch (err) {
      console.error("Login failed:", err);
      Alert.alert("Error", "Login failed. Check backend URL and server status.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Login</Text>
      <TextInput 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        style={styles.input} 
        keyboardType="email-address"
      />
      <TextInput 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        style={styles.input} 
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:"center", padding:20 },
  heading: { fontSize:24, fontWeight:"bold", marginBottom:20 },
  input: { borderWidth:1, borderColor:"#ccc", marginBottom:15, padding:10, borderRadius:5 }
});
