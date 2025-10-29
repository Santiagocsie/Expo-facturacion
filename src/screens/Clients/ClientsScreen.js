// src/screens/Clients/ClientsScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useNavigation, useIsFocused } from '@react-navigation/native';

// Ícono de papelera (asumimos que está instalado 'expo install @expo/vector-icons')
import { Ionicons } from '@expo/vector-icons'; 

const COLORS = {
    primary: '#007AFF',
    card: '#FFFFFF',
    background: '#F9F9F9',
    textPrimary: '#1C1C1E',
    textSecondary: '#636366',
    danger: '#FF3B30',
};
const RADIUS = 12;
const PADDING = 15;

const ClientsScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // Hook para refrescar al volver a la pantalla
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  // Función para LEER todos los clientes
  const fetchClients = async () => {
    setLoading(true);
    try {
      const clientsCol = collection(db, 'clients'); // 'clients' es el nombre de la colección en Firestore
      const clientSnapshot = await getDocs(clientsCol);
      const clientList = clientSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setClients(clientList);
    } catch (error) {
      console.error("Error al obtener clientes: ", error);
      Alert.alert("Error", "No se pudieron cargar los clientes.");
    } finally {
      setLoading(false);
    }
  };

  // Función para BORRAR un cliente
  const handleDelete = (id, name) => {
    Alert.alert(
      "Confirmar Eliminación",
      `¿Estás seguro de que quieres eliminar a ${name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "clients", id));
              Alert.alert("Éxito", "Cliente eliminado correctamente.");
              fetchClients(); // Refrescar la lista
            } catch (error) {
              console.error("Error al eliminar cliente: ", error);
              Alert.alert("Error", "No se pudo eliminar el cliente.");
            }
          }
        }
      ]
    );
  };

  // Cargar clientes cada vez que la pantalla esté enfocada
  useEffect(() => {
    if (isFocused) {
      fetchClients();
    }
  }, [isFocused]);

  // Renderizado de cada ítem de cliente
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.nameText}>{item.name}</Text>
        <Text style={styles.detailText}>ID: {item.identification}</Text>
        <Text style={styles.detailText}>Tel: {item.phone}</Text>
      </View>
      <View style={styles.actionsContainer}>
        {/* Botón EDITAR (navega a ClientForm con los datos del cliente) */}
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => navigation.navigate('ClientForm', { client: item })}
        >
          <Ionicons name="create-outline" size={24} color="#0066cc" />
        </TouchableOpacity>
        
        {/* Botón BORRAR */}
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => handleDelete(item.id, item.name)}
        >
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {clients.length === 0 ? (
        <View style={styles.centered}>
            <Text style={styles.emptyText}>Aún no hay clientes registrados.</Text>
            <Text style={styles.emptyTextHint}>Usa el botón '+' para agregar uno.</Text>
        </View>
      ) : (
        <FlatList
          data={clients}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
      
      {/* Botón flotante para CREAR nuevo cliente */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('ClientForm', { client: null })} // <-- ¡ESTO ES CLAVE!
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        padding: PADDING,
        marginHorizontal: PADDING,
        marginTop: 10,
        borderRadius: RADIUS, // Bordes suaves
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary, // Barra azul
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 3,
        elevation: 2,
    },
    textContainer: { flex: 1 },
    nameText: { fontSize: 17, fontWeight: '600', color: COLORS.textPrimary },
    detailText: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
    actionsContainer: { flexDirection: 'row' },
    editButton: { marginLeft: 10, padding: 5 },
    deleteButton: { marginLeft: 10, padding: 5 },
    addButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: COLORS.primary,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5,
    },
    emptyText: { fontSize: 18, color: COLORS.textSecondary },
    emptyTextHint: { fontSize: 14, color: COLORS.textSecondary, opacity: 0.7, marginTop: 5 },
});

export default ClientsScreen;