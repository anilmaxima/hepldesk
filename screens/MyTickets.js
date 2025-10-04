import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet, Image } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from "../config";

export default function MyTickets({ navigation, setRole }) {
  const [tickets, setTickets] = useState([]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('role');
    setRole(null);
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tickets`);
      const data = await res.json();
      // Ensure that attachmentUrl has full URL
      const updatedData = data.map(ticket => ({
        ...ticket,
        attachmentUrl: ticket.attachmentUrl && !ticket.attachmentUrl.startsWith('http')
          ? `${API_URL}${ticket.attachmentUrl}`
          : ticket.attachmentUrl
      }));
      setTickets(updatedData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const renderTicket = ({ item }) => (
    <TouchableOpacity
      style={ticketStyles.ticketContainer}
      onPress={() => navigation.navigate("TicketDetails", { ticketId: item._id })}
    >
      <Text style={ticketStyles.description}>{item.description}</Text>
      <Text style={[ticketStyles.status, 
        { color: item.status === "new" ? "red" : item.status === "in_progress" ? "orange" : "green" }
      ]}>{item.status.toUpperCase()}</Text>
      {item.attachmentUrl && (
        <Image source={{ uri: item.attachmentUrl }} style={ticketStyles.attachment} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={ticketStyles.container}>
      <Button title="Logout" onPress={handleLogout} color="#d9534f"/>
      <FlatList
        data={tickets}
        keyExtractor={item => item._id}
        renderItem={renderTicket}
        contentContainerStyle={{ paddingVertical: 10 }}
      />
    </View>
  );
}

const ticketStyles = StyleSheet.create({
  container: { flex:1, padding:20 },
  ticketContainer: { padding:15, borderBottomWidth:1, borderColor:"#ccc", marginBottom:10, borderRadius:5, backgroundColor:"#f9f9f9" },
  description: { fontSize:16, fontWeight:"500", marginBottom:5 },
  status: { fontWeight:"bold", marginBottom:5 },
  attachment: { width: 150, height: 150, marginTop:5, borderRadius:5 }
});
