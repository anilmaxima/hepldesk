import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from "../config";

export default function SubmitTicket({ navigation, setRole }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null); // local image URI
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('role');
    setRole(null);
  };

  // Pick image from gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!name || !email || !description) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("description", description);

    if (image) {
      const filename = image.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      formData.append("attachment", { uri: image, name: filename, type });
    }

    try {
      const res = await fetch(`${API_URL}/api/tickets`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to submit ticket");

      const ticket = await res.json();

      Alert.alert("Success", "Ticket submitted!");

      // Reset fields
      setName(""); 
      setEmail(""); 
      setDescription(""); 
      setImage(null);

      // Navigate to Ticket Details to show uploaded image
      navigation.navigate("TicketDetails", { ticketId: ticket._id });

    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to submit ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Logout" onPress={handleLogout} color="#d9534f"/>
      <Text style={styles.heading}>Submit Ticket</Text>

      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address"/>
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, { height:100 }]}
        multiline
      />

      <TouchableOpacity onPress={pickImage} style={styles.pickButton}>
        <Text style={styles.pickButtonText}>{image ? "Change Attachment" : "Pick Attachment"}</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

      <Button title={submitting ? "Submitting..." : "Submit Ticket"} onPress={handleSubmit} color="#28a745" disabled={submitting}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20 },
  heading: { fontSize:22, fontWeight:"bold", marginVertical:10 },
  input: { borderWidth:1, borderColor:"#ccc", marginBottom:15, padding:10, borderRadius:5 },
  pickButton: { backgroundColor:"#007bff", padding:10, borderRadius:5, marginBottom:10, alignItems:"center" },
  pickButtonText: { color:"#fff", fontWeight:"bold" },
  imagePreview: { width:200, height:200, marginVertical:10, alignSelf:"center" }
});
