import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Button, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from "../config";

export default function AdminDashboard({ navigation, setRole }) {
  const [tickets, setTickets] = useState([]);

  // Fetch all tickets
  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tickets`);
      const data = await res.json();
      setTickets(data);
    } catch(err){ console.error(err); Alert.alert("Error", "Failed to fetch tickets"); }
  };

  // Update ticket status
  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/api/tickets/${id}/status`, {
        method:"PATCH",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({status})
      });
      if (!res.ok) throw new Error("Failed to update status");
      fetchTickets();
    } catch(err){ Alert.alert("Error","Failed to update status"); }
  };

  // Logout
  const handleLogout = async () => {
    await AsyncStorage.removeItem('role');
    setRole(null);
  };

  useEffect(() => { fetchTickets(); }, []);

  // Get color based on status
  const getStatusColor = (status) => {
    if (status === "new") return "red";
    if (status === "in_progress") return "orange";
    return "green";
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Admin Dashboard</Text>
        <Button title="Logout" onPress={handleLogout} color="#d9534f"/>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={item => item._id}
        renderItem={({item}) => (
          <TouchableOpacity 
            style={styles.ticket} 
            onPress={() => navigation.navigate("TicketDetails", { ticketId: item._id })}
          >
            <Text style={styles.title}>{item.description}</Text>
            <Text>Status: <Text style={{ color: getStatusColor(item.status) }}>{item.status.toUpperCase()}</Text></Text>

            <View style={styles.statusButtons}>
              {item.status !== "new" && <Button title="Set New" onPress={() => updateStatus(item._id, "new")} />}
              {item.status !== "in_progress" && <Button title="In Progress" onPress={() => updateStatus(item._id, "in_progress")} />}
              {item.status !== "resolved" && <Button title="Resolved" onPress={() => updateStatus(item._id, "resolved")} />}
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:20 },
  header:{ flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:10 },
  heading:{ fontSize:22, fontWeight:"bold" },
  ticket:{ padding:15, borderBottomWidth:1, borderColor:"#ccc", marginBottom:10, borderRadius:5, backgroundColor:"#f9f9f9" },
  title:{ fontSize:16, fontWeight:"500", marginBottom:5 },
  statusButtons:{ flexDirection:"row", justifyContent:"space-between", marginTop:10 }
});
