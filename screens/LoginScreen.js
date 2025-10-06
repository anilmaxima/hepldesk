import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config'; // Ensure this points to your backend

export default function LoginScreen({ setRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLoginOrSignup = async () => {
    if (!email || !password || (isSignup && !confirmPassword)) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (isSignup && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // Single API call (your backend handles both login or registration automatically)
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) throw new Error("Network response not ok");
      const data = await res.json();

      if (data.role) {
        await AsyncStorage.setItem("role", data.role);
        setRole(data.role);
        Alert.alert("Success", `${isSignup ? "Sign Up" : "Login"} successful!`);
      } else {
        Alert.alert("Error", "Login/Sign In failed. Try again.");
      }
    } catch (err) {
      console.error("Login/Signup failed:", err);
      Alert.alert("Error", "Login/Sign In failed. Check backend and network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{isSignup ? "Sign Up" : "Login"}</Text>

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

      {isSignup && (
        <TextInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          secureTextEntry
        />
      )}

      <Button
        title={loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
        onPress={handleLoginOrSignup}
        disabled={loading}
      />

      {/* Toggle between Login / Sign Up (UI only, same API call) */}
      <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
        <Text style={styles.toggleText}>
          {isSignup
            ? "Already have an account? Login"
            : "Don’t have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    padding: 10,
    borderRadius: 5
  },
  toggleText: {
    marginTop: 15,
    textAlign: "center",
    color: "#007BFF",
    textDecorationLine: "underline"
  }
});
