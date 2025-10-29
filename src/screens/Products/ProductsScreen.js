// src/screens/Products/ProductsScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 

const COLORS = {
    primary: '#007AFF',      // Azul (Botones principales)
    success: '#34C759',      // Verde (Inventario y acento de Productos)
    card: '#FFFFFF',         // Blanco (Tarjetas)
    background: '#F9F9F9',   // Gris muy suave
    textPrimary: '#1C1C1E',  // Texto Oscuro
    textSecondary: '#636366',// Texto Gris
    danger: '#FF3B30',       // Rojo
};
const RADIUS = 12;
const PADDING = 15;

const ProductsScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Función para LEER todos los productos
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productsCol = collection(db, 'products'); 
      const productSnapshot = await getDocs(productsCol);
      const productList = productSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setProducts(productList);
    } catch (error) {
      console.error("Error al obtener productos: ", error);
      Alert.alert("Error", "No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  };

  // Función para BORRAR un producto
  const handleDelete = (id, name) => {
    Alert.alert(
      "Confirmar Eliminación",
      `¿Estás seguro de que quieres eliminar el producto ${name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "products", id));
              Alert.alert("Éxito", "Producto eliminado correctamente.");
              fetchProducts(); // Refrescar la lista
            } catch (error) {
              console.error("Error al eliminar producto: ", error);
              Alert.alert("Error", "No se pudo eliminar el producto.");
            }
          }
        }
      ]
    );
  };

  // Cargar productos cada vez que la pantalla esté enfocada
  useEffect(() => {
    if (isFocused) {
      fetchProducts();
    }
  }, [isFocused]);

  // Renderizado de cada ítem de producto
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.nameText}>{item.name}</Text>
        <Text style={styles.detailText}>SKU: {item.sku}</Text>
        <Text style={styles.stockText}>Stock: {item.stock} unidades</Text>
        <Text style={styles.priceText}>Precio: ${item.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Text> 
      </View>
      <View style={styles.actionsContainer}>
        {/* Botón EDITAR */}
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => navigation.navigate('ProductForm', { product: item })}
        >
          <Ionicons name="create-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        
        {/* Botón BORRAR */}
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => handleDelete(item.id, item.name)}
        >
          <Ionicons name="trash-outline" size={24} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.success} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {products.length === 0 ? (
        <View style={styles.centered}>
            <Text style={styles.emptyText}>Aún no hay productos registrados.</Text>
            <Text style={styles.emptyTextHint}>Usa el botón '+' para agregar uno.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
      
      {/* Botón flotante para CREAR nuevo producto */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('ProductForm', { product: null })} // 'product: null' indica CREAR
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
    borderRadius: RADIUS,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success, // Barra verde para productos
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  textContainer: { flex: 1 },
  nameText: { fontSize: 17, fontWeight: '600', color: COLORS.textPrimary },
  detailText: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  stockText: { fontSize: 14, color: COLORS.success, fontWeight: 'bold', marginTop: 2 },
  priceText: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginTop: 5 },
  actionsContainer: { flexDirection: 'row' },
  editButton: { marginLeft: 10, padding: 5 },
  deleteButton: { marginLeft: 10, padding: 5 },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.success, // Botón verde
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

export default ProductsScreen;