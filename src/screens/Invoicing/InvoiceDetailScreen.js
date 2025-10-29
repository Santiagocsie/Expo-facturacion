// src/screens/Invoicing/InvoiceDetailScreen.js

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 

// 🎨 Definición del Tema Global
const COLORS = {
    primary: '#007AFF',      // Azul
    accent: '#FF9500',       // Naranja (Total Principal)
    card: '#FFFFFF',         // Blanco
    background: '#F9F9F9',   // Gris muy suave
    textPrimary: '#1C1C1E',  // Texto Oscuro
    textSecondary: '#636366',// Texto Gris
    success: '#34C759',      // Verde (Ítems)
};
const RADIUS = 12;
const PADDING = 15;

const InvoiceDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { invoice, invoiceNumber } = route.params; 

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };
    
    const formatCurrency = (amount) => {
        return `$${(amount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    };

    const renderProductItem = (item, index) => (
        <View key={index} style={styles.productCard}>
            <View style={styles.productHeader}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>{formatCurrency(item.price)} x {item.quantity}</Text>
            </View>
            <View style={styles.productDetails}>
                <Text style={styles.detailText}>SKU: {item.sku}</Text>
                <Text style={styles.productSubtotal}>Total: {formatCurrency(item.subtotal)}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* --- SECCIÓN INFORMACIÓN GENERAL --- */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Información General</Text>
                    
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={18} color={COLORS.primary} style={styles.iconStyle} />
                        <Text style={styles.infoLabel}>Cliente:</Text>
                        <Text style={styles.infoValue}>{invoice.client.name}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Ionicons name="id-card-outline" size={18} color={COLORS.primary} style={styles.iconStyle} />
                        <Text style={styles.infoLabel}>ID/Cédula:</Text>
                        <Text style={styles.infoValue}>{invoice.client.identification}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={18} color={COLORS.primary} style={styles.iconStyle} />
                        <Text style={styles.infoLabel}>Fecha:</Text>
                        <Text style={styles.infoValue}>{formatDateTime(invoice.date)}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Ionicons name="card-outline" size={18} color={COLORS.primary} style={styles.iconStyle} />
                        <Text style={styles.infoLabel}>Estatus:</Text>
                        <Text style={styles.infoValueStatus}>{invoice.status}</Text> 
                    </View>
                </View>

                {/* --- SECCIÓN PRODUCTOS --- */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Productos Vendidos</Text>
                    {invoice.items.map(renderProductItem)}
                </View>

                {/* --- SECCIÓN TOTALES --- */}
                <View style={[styles.card, styles.totalsCard]}>
                    <Text style={styles.cardTitle}>Resumen Financiero</Text>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(invoice.subTotal)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>IVA (19%):</Text>
                        <Text style={styles.totalValue}>{formatCurrency(invoice.taxes)}</Text>
                    </View>
                    <View style={styles.finalTotalBox}>
                        <Text style={styles.finalTotalLabel}>Total Pagado:</Text>
                        <Text style={styles.finalTotalValue}>{formatCurrency(invoice.total)}</Text>
                    </View>
                </View>

            </ScrollView>
            
            {/* BOTÓN DE CERRAR */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back-outline" size={24} color={COLORS.card} />
                    <Text style={styles.closeButtonText}>Volver al Historial</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { padding: PADDING, paddingBottom: 100 },
    
    // Tarjetas principales
    card: { 
        backgroundColor: COLORS.card, 
        padding: PADDING, 
        borderRadius: RADIUS, 
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 3,
    },
    cardTitle: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        marginBottom: 15, 
        color: COLORS.textPrimary,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 8,
    },
    
    // Información General
    infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
    iconStyle: { marginRight: 10 },
    infoLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, width: 90 },
    infoValue: { fontSize: 14, color: COLORS.textPrimary, flex: 1 },
    infoValueStatus: { fontSize: 14, fontWeight: 'bold', color: COLORS.success, flex: 1 },


    // Productos
    productCard: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    productHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    productName: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
    productPrice: { fontSize: 14, color: COLORS.textSecondary },
    productDetails: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
    detailText: { fontSize: 14, color: COLORS.textSecondary },
    productSubtotal: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: COLORS.success, // Verde para subtotal de item
    },

    // Totales
    totalsCard: { borderLeftWidth: 5, borderLeftColor: COLORS.accent },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
    totalLabel: { fontSize: 16, color: COLORS.textPrimary },
    totalValue: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
    finalTotalBox: {
        marginTop: 15,
        padding: 15,
        backgroundColor: '#FFF5E6', // Naranja claro
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    finalTotalLabel: { fontSize: 18, fontWeight: 'bold', color: COLORS.accent },
    finalTotalValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.accent },
    
    // Footer y Botón
    footer: { borderTopWidth: 1, borderTopColor: '#E5E5EA', padding: 10, backgroundColor: COLORS.card },
    closeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: RADIUS,
    },
    closeButtonText: {
        color: COLORS.card,
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});

export default InvoiceDetailScreen;