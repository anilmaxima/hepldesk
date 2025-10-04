import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Button, FlatList, Image, Alert, ScrollView } from "react-native";
import { API_URL } from "../config";

export default function TicketDetails({ route }) {
  const { ticketId } = route.params;
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");

  // Fetch ticket details and messages
  const fetchTicketDetails = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tickets/${ticketId}`);
      const data = await res.json();
      // Ensure attachmentUrl has full URL
      if (data.ticket && data.ticket.attachmentUrl && !data.ticket.attachmentUrl.startsWith("http")) {
        data.ticket.attachmentUrl = `${API_URL}${data.ticket.attachmentUrl}`;
      }
      setTicket(data.ticket);
      setMessages(data.messages);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch ticket details");
    }
  };

  // Send a reply
  const handleReply = async () => {
    if (!reply.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/tickets/${ticketId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: "support", message: reply })
      });
      if (!res.ok) throw new Error("Failed to send reply");
      setReply("");
      fetchTicketDetails();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to send reply");
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, []);

  if (!ticket) return <Text style={{ padding: 20 }}>Loading ticket...</Text>;

  return (
    <ScrollView contentContainerStyle={ticketStyles.container}>
      <Text style={ticketStyles.heading}>Ticket Details</Text>
      <Text style={ticketStyles.label}>Name: {ticket.name}</Text>
      <Text style={ticketStyles.label}>Email: {ticket.email}</Text>
      <Text style={ticketStyles.label}>Description: {ticket.description}</Text>
      <Text style={[ticketStyles.label, { fontWeight: "bold", color: ticket.status === "new" ? "red" : ticket.status === "in_progress" ? "orange" : "green" }]}>
        Status: {ticket.status.toUpperCase()}
      </Text>

      {ticket.attachmentUrl && (
        <Image
          source={{ uri: ticket.attachmentUrl }}
          style={ticketStyles.image}
          resizeMode="contain"
        />
      )}

      <Text style={[ticketStyles.heading, { marginTop: 20 }]}>Messages</Text>
      <FlatList
        data={messages}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={ticketStyles.message}>
            <Text style={ticketStyles.author}>{item.author}:</Text>
            <Text>{item.message}</Text>
          </View>
        )}
      />

      <TextInput
        placeholder="Write a reply..."
        value={reply}
        onChangeText={setReply}
        style={ticketStyles.input}
        multiline
      />
      <Button title="Send Reply" onPress={handleReply} color="#28a745"/>
    </ScrollView>
  );
}

const ticketStyles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 50 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  label: { marginBottom: 5, fontSize: 16 },
  image: { width: "100%", height: 250, marginVertical: 10, borderRadius: 5 },
  message: { padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, marginBottom: 5 },
  author: { fontWeight: "bold", marginBottom: 3 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginVertical: 10, minHeight: 60 }
});
