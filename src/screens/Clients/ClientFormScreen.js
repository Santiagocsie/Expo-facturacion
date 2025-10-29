// src/screens/Clients/ClientFormScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { collection, doc, setDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

const COLORS = {
    primary: '#007AFF',
    card: '#FFFFFF',
    background: '#F9F9F9',
    textPrimary: '#1C1C1E',
};
const RADIUS = 12;
const PADDING = 20;

const ClientFormScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const existingClient = route.params?.client; // Obtiene el cliente si estamos en modo EDICIÓN
  
  const [name, setName] = useState('');
  const [identification, setIdentification] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditing = existingClient !== null;

  // Llenar el formulario si estamos en modo edición
  useEffect(() => {
    if (isEditing) {
      navigation.setOptions({ title: 'Editar Cliente' });
      setName(existingClient.name);
      setIdentification(existingClient.identification);
      setEmail(existingClient.email);
      setPhone(existingClient.phone);
      setAddress(existingClient.address);
    } else {
      navigation.setOptions({ title: 'Nuevo Cliente' });
    }
  }, [existingClient, isEditing]);

  const handleSubmit = async () => {
    if (!name || !identification || !phone) {
      Alert.alert('Error', 'Los campos Nombre, Identificación y Teléfono son obligatorios.');
      return;
    }
    
    setLoading(true);
    const clientData = { name, identification, email, phone, address };

     try {
      if (isEditing) {
        // Modo EDITAR (UPDATE)
        const clientRef = doc(db, 'clients', existingClient.id);
        await updateDoc(clientRef, clientData);
        Alert.alert('Éxito', 'Cliente actualizado correctamente.');
      } else {
        // Modo CREAR (CREATE)
        const clientsCol = collection(db, 'clients');
        await addDoc(clientsCol, clientData);
        Alert.alert('Éxito', 'Cliente guardado correctamente.');
      }
      
      // 🛑 CORRECCIÓN CLAVE: Usamos .replace() para ir a la lista de Clientes
      navigation.replace('Clients'); 
      
    } catch (error) {
      console.error("Error al guardar cliente: ", error);
      Alert.alert('Error', 'Ocurrió un error al guardar el cliente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nombre Completo *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ej: Juan Pérez"
      />

      <Text style={styles.label}>Cédula/NIT *</Text>
      <TextInput
        style={styles.input}
        value={identification}
        onChangeText={setIdentification}
        placeholder="Ej: 1039876543"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Teléfono *</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Ej: 3001234567"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Correo Electrónico</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Ej: correo@cliente.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Dirección</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={address}
        onChangeText={setAddress}
        placeholder="Ej: Calle 10 # 5-20, Bogotá"
        multiline
      />

      <View style={styles.buttonContainer}>
        <Button 
          title={isEditing ? 'Guardar Cambios' : 'Crear Cliente'} 
          onPress={handleSubmit} 
          color="#0066cc"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: PADDING, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginTop: 15, marginBottom: 5 },
  input: {
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA', // Color de borde muy suave
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  textArea: {
    minHeight: 100, // Mayor espacio para la dirección
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 50,
  }
});

export default ClientFormScreen;