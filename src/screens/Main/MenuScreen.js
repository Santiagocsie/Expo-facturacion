// src/screens/Main/MenuScreen.js (CORREGIDO)

import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { signOut } from 'firebase/auth'; 
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../config/firebaseConfig'; 
import { useNavigation } from '@react-navigation/native'; // Importar useNavigation

// 🎨 Definición del Tema Local
const COLORS = {
    primary: '#007AFF', // Azul
    secondary: '#FF9500', // Naranja
    card: '#FFFFFF',
    background: '#F9F9F9',
    textPrimary: '#1C1C1E',
    textSecondary: '#636366',
};
const RADIUS = 12;
const PADDING = 20;

const MenuScreen = () => {
  const navigation = useNavigation(); // Hook para navegar
  
  const modules = [
        { 
            title: "1. Clientes (CRUD)", 
            screen: 'Clients', 
            icon: 'people-circle-outline', 
            color: COLORS.primary 
        },
        { 
            title: "2. Productos (Inventario)", 
            screen: 'Products', 
            icon: 'cube-outline', 
            color: COLORS.primary 
        },
        { 
            title: "3. Nueva Factura", 
            screen: 'NewInvoice', 
            icon: 'receipt-outline', 
            color: COLORS.secondary 
        },
        { 
            title: "4. Historial de Facturas", 
            screen: 'Invoices', 
            icon: 'archive-outline', 
            color: COLORS.primary 
        },
    ];

  const handleLogout = () => {
        Alert.alert(
            "Cerrar Sesión",
            "¿Estás seguro de que quieres cerrar la sesión?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Sí, Cerrar",
                    onPress: async () => {
                        try {
                            await auth.signOut();
                        } catch (error) {
                            console.error("Error al cerrar sesión:", error);
                        }
                    },
                    style: "destructive",
                },
            ]
        );
    };
  
  return (
        <ScrollView style={styles.container}>
            <Text style={styles.welcomeText}>Hola, {auth.currentUser?.email}</Text>
            <Text style={styles.subtitleText}>Elige el módulo al que quieres acceder:</Text>

            <View style={styles.moduleGrid}>
                {modules.map((module, index) => (
                    <TouchableOpacity 
                        key={index}
                        style={styles.menuCard}
                        onPress={() => navigation.navigate(module.screen)}
                    >
                        <Ionicons name={module.icon} size={40} color={module.color} />
                        <Text style={styles.cardTitle}>{module.title.split('. ')[1]}</Text>
                        <Text style={styles.cardSubtitle}>{module.title.split('. ')[0]}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <Ionicons name="log-out-outline" size={24} color={COLORS.textSecondary} />
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: COLORS.background, 
        paddingHorizontal: PADDING 
    },
    welcomeText: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: COLORS.textPrimary, 
        marginTop: 30,
    },
    subtitleText: { 
        fontSize: 16, 
        color: COLORS.textSecondary, 
        marginBottom: 20 
    },
    moduleGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    menuCard: {
        backgroundColor: COLORS.card,
        width: '48%', // Dos tarjetas por fila
        padding: 20,
        borderRadius: RADIUS,
        marginBottom: 15,
        alignItems: 'flex-start',
        // Sombra suave (Estilo iOS)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // Android
        minHeight: 140,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginTop: 10,
    },
    cardSubtitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        opacity: 0.6,
        position: 'absolute',
        top: 8,
        right: 10,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        marginTop: 30,
        marginBottom: 40,
        borderRadius: RADIUS,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginLeft: 10,
    }
});

export default MenuScreen;