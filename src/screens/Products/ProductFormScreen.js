// src/screens/Products/ProductFormScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { collection, doc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

// 🎨 Definición del Tema Global
const COLORS = {
    primary: '#007AFF',      // Azul
    success: '#34C759',      // Verde (Botón principal)
    card: '#FFFFFF',         // Blanco
    background: '#F9F9F9',   // Gris muy suave
    textPrimary: '#1C1C1E',  // Texto Oscuro
    borderColor: '#E5E5EA',  // Borde suave
};
const RADIUS = 12;
const PADDING = 20;

const ProductFormScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const existingProduct = route.params?.product; 
  
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditing = existingProduct !== null;

  useEffect(() => {
    if (isEditing) {
      navigation.setOptions({ title: 'Editar Producto' });
      setName(existingProduct.name);
      setSku(existingProduct.sku);
      setPrice(String(existingProduct.price || ''));
      setStock(String(existingProduct.stock || ''));
      setDescription(existingProduct.description);
    } else {
      navigation.setOptions({ title: 'Nuevo Producto' });
    }
  }, [existingProduct, isEditing]);

  const handleSubmit = async () => {
    if (!name || !sku || !price || !stock) {
      Alert.alert('Error', 'Los campos Nombre, SKU, Precio y Stock son obligatorios.');
      return;
    }
    
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock, 10);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
        Alert.alert('Error', 'El precio debe ser un número positivo.');
        return;
    }
    if (isNaN(parsedStock) || parsedStock < 0) {
        Alert.alert('Error', 'El stock debe ser un número entero no negativo.');
        return;
    }

    setLoading(true);
    const productData = { 
        name, 
        sku, 
        description, 
        price: parsedPrice, 
        stock: parsedStock 
    };

    try {
      if (isEditing) {
        const productRef = doc(db, 'products', existingProduct.id);
        await updateDoc(productRef, productData);
        Alert.alert('Éxito', 'Producto actualizado correctamente.');
      } else {
        const productsCol = collection(db, 'products');
        await addDoc(productsCol, productData);
        Alert.alert('Éxito', 'Producto guardado correctamente.');
      }
      navigation.goBack(); 
    } catch (error) {
      console.error("Error al guardar producto: ", error);
      Alert.alert('Error', 'Ocurrió un error al guardar el producto.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.success} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nombre del Producto *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ej: Portátil i7"
        placeholderTextColor={COLORS.textSecondary}
      />

      <Text style={styles.label}>SKU / Código *</Text>
      <TextInput
        style={styles.input}
        value={sku}
        onChangeText={setSku}
        placeholder="Ej: P001-A"
        autoCapitalize="characters"
        placeholderTextColor={COLORS.textSecondary}
      />
      
      <Text style={styles.label}>Precio de Venta *</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="Ej: 2500000.00"
        keyboardType="numeric"
        placeholderTextColor={COLORS.textSecondary}
      />

      <Text style={styles.label}>Stock (Inventario) *</Text>
      <TextInput
        style={styles.input}
        value={stock}
        onChangeText={setStock}
        placeholder="Ej: 50"
        keyboardType="numeric"
        placeholderTextColor={COLORS.textSecondary}
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Detalles técnicos, garantías..."
        multiline
        placeholderTextColor={COLORS.textSecondary}
      />

      <View style={styles.buttonContainer}>
        <Button 
          title={isEditing ? 'Guardar Cambios' : 'Crear Producto'} 
          onPress={handleSubmit} 
          color={COLORS.success} // Botón verde
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
        borderColor: COLORS.borderColor,
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    buttonContainer: {
        marginTop: 30,
        marginBottom: 50,
    }
});

export default ProductFormScreen;