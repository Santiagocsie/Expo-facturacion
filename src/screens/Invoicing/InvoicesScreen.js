// src/screens/Invoicing/InvoicesScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 

// 🎨 Definición del Tema Global
const COLORS = {
    primary: '#007AFF',      // Azul (Barra lateral)
    accent: '#FF9500',       // Naranja (Acento de totales)
    card: '#FFFFFF',         // Blanco
    background: '#F9F9F9',   // Gris muy suave
    textPrimary: '#1C1C1E',  // Texto Oscuro
    textSecondary: '#636366',// Texto Gris
    success: '#34C759',      // Verde (Estatus)
};
const RADIUS = 12;
const PADDING = 15;

const InvoicesScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const invoicesQuery = query(
        collection(db, 'invoices'), 
        orderBy('date', 'desc')
      );
      
      const invoiceSnapshot = await getDocs(invoicesQuery);
      
      let invoiceCount = invoiceSnapshot.docs.length;
      
      const invoiceList = invoiceSnapshot.docs.map((doc, index) => {
          const invoiceNumber = invoiceCount - index;

          return { 
              id: doc.id, 
              ...doc.data(),
              invoiceNumber: invoiceNumber 
          }
      });
      setInvoices(invoiceList);
    } catch (error) {
      console.error("Error al obtener facturas: ", error);
      Alert.alert("Error", "No se pudieron cargar las facturas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchInvoices();
    }
  }, [isFocused]);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };
  
  const formatCurrency = (amount) => {
      return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.itemContainer}
      onPress={() => navigation.navigate('InvoiceDetail', { invoice: item, invoiceNumber: item.invoiceNumber })}
    >
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>Factura #{item.invoiceNumber}</Text>
        
        <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} style={{ marginRight: 5 }} />
            <Text style={styles.detailText}>{item.client.name}</Text>
        </View>
        
        <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} style={{ marginRight: 5 }} />
            <Text style={styles.detailText}>{formatDate(item.date)}</Text>
        </View>
        
        <Text style={styles.statusText}>Estatus: {item.status}</Text> 
      </View>
      
      <View style={styles.totalBox}>
        <Text style={styles.totalValue}>{formatCurrency(item.total)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {invoices.length === 0 ? (
        <View style={styles.centered}>
            <Text style={styles.emptyText}>Aún no se han generado facturas.</Text>
            <Text style={styles.emptyTextHint}>Usa el módulo "Nueva Factura" para comenzar.</Text>
        </View>
      ) : (
        <FlatList
          data={invoices}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
      
      {/* Botón flotante para Nueva Factura (Similar al + de Clientes/Productos) */}
      <TouchableOpacity
        style={styles.newInvoiceButton}
        onPress={() => navigation.navigate('NewInvoice')}
      >
        <Ionicons name="add-outline" size={32} color={COLORS.card} />
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
    borderLeftColor: COLORS.primary, // Barra azul
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  textContainer: { flex: 1 },
  titleText: { fontSize: 17, fontWeight: '600', color: COLORS.textPrimary },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  detailText: { fontSize: 13, color: COLORS.textSecondary },
  statusText: { fontSize: 14, color: COLORS.success, fontWeight: 'bold', marginTop: 5 },
  totalBox: {
    padding: 10,
    backgroundColor: '#FFF5E6', // Fondo naranja muy claro
    borderRadius: 8,
    marginLeft: 10,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.accent, // Naranja
  },
  newInvoiceButton: {
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

export default InvoicesScreen;