import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CustomClaimDesignerScreen() {
    const router = useRouter();
    const [claimName, setClaimName] = useState('');
    const [prizeAmount, setPrizeAmount] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());

    // 3x9 grid representing a Tambola ticket
    const toggleCell = (row: number, col: number) => {
        const cellKey = `${row}-${col}`;
        const newSelected = new Set(selectedCells);

        if (newSelected.has(cellKey)) {
            newSelected.delete(cellKey);
        } else {
            newSelected.add(cellKey);
        }

        setSelectedCells(newSelected);
    };

    const saveCustomClaim = async () => {
        if (!claimName.trim()) {
            Alert.alert('Error', 'Please enter a claim name');
            return;
        }

        if (!prizeAmount || parseInt(prizeAmount) <= 0) {
            Alert.alert('Error', 'Please enter a valid prize amount');
            return;
        }

        if (selectedCells.size === 0) {
            Alert.alert('Error', 'Please select at least one cell in the pattern');
            return;
        }

        try {
            // Create custom claim object
            const customClaim = {
                id: `custom_${Date.now()}`,
                name: claimName.trim(),
                amount: prizeAmount,
                description: description.trim(),
                pattern: Array.from(selectedCells),
                category: 'Custom',
                enabled: true,
            };

            // Save to AsyncStorage
            const prizesData = await AsyncStorage.getItem('selected_prizes');
            const allPrizes = prizesData ? JSON.parse(prizesData) : [];

            // Add new custom claim
            allPrizes.push(customClaim);

            await AsyncStorage.setItem('selected_prizes', JSON.stringify(allPrizes));

            Alert.alert('Success', 'Custom claim created successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('Error saving custom claim:', error);
            Alert.alert('Error', 'Failed to save custom claim');
        }
    };

    const clearPattern = () => {
        setSelectedCells(new Set());
    };

    const renderGrid = () => {
        const rows = [];

        for (let row = 0; row < 3; row++) {
            const cells = [];

            for (let col = 0; col < 9; col++) {
                const cellKey = `${row}-${col}`;
                const isSelected = selectedCells.has(cellKey);

                cells.push(
                    <TouchableOpacity
                        key={cellKey}
                        style={[
                            styles.gridCell,
                            isSelected && styles.gridCellSelected
                        ]}
                        onPress={() => toggleCell(row, col)}
                    >
                        {isSelected && (
                            <MaterialCommunityIcons
                                name="check"
                                size={16}
                                color="#FFF"
                            />
                        )}
                    </TouchableOpacity>
                );
            }

            rows.push(
                <View key={row} style={styles.gridRow}>
                    {cells}
                </View>
            );
        }

        return rows;
    };

    return (
        <LinearGradient colors={['#1a5f1a', '#2d8b2d']} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#FFD700" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Design Custom Claim</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Claim Details</Text>

                        <Text style={styles.label}>Claim Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Star Pattern, Diamond Shape"
                            placeholderTextColor="#999"
                            value={claimName}
                            onChangeText={setClaimName}
                        />

                        <Text style={styles.label}>Prize Amount (₹) *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., 100, 500, 1000"
                            placeholderTextColor="#999"
                            value={prizeAmount}
                            onChangeText={setPrizeAmount}
                            keyboardType="numeric"
                        />

                        <Text style={styles.label}>Description (Optional)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Describe your custom pattern..."
                            placeholderTextColor="#999"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.section}>
                        <View style={styles.patternHeader}>
                            <Text style={styles.sectionTitle}>Design Pattern *</Text>
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={clearPattern}
                            >
                                <MaterialCommunityIcons name="refresh" size={18} color="#FF6B35" />
                                <Text style={styles.clearButtonText}>Clear</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.instruction}>
                            Tap cells to select the pattern for your custom claim
                        </Text>

                        <View style={styles.gridContainer}>
                            {renderGrid()}
                        </View>

                        <Text style={styles.selectedCount}>
                            {selectedCells.size} cell{selectedCells.size !== 1 ? 's' : ''} selected
                        </Text>
                    </View>

                    <View style={styles.exampleSection}>
                        <MaterialCommunityIcons name="information" size={20} color="#FFD700" />
                        <Text style={styles.exampleText}>
                            Tip: Create unique patterns like stars, arrows, or any custom shape you want!
                        </Text>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={saveCustomClaim}
                    >
                        <Text style={styles.saveButtonText}>Save Custom Claim</Text>
                        <MaterialCommunityIcons name="check" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 2,
        borderBottomColor: '#FFD700',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFD700',
    },
    content: {
        padding: 16,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#4A4A4A',
        borderWidth: 2,
        borderColor: '#FFD700',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    patternHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255, 107, 53, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#FF6B35',
    },
    clearButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF6B35',
    },
    instruction: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 16,
        fontStyle: 'italic',
    },
    gridContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 12,
        borderWidth: 2,
        borderColor: '#FFD700',
    },
    gridRow: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 6,
    },
    gridCell: {
        flex: 1,
        aspectRatio: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    gridCellSelected: {
        backgroundColor: '#FFD700',
        borderColor: '#FFF',
        borderWidth: 2,
    },
    selectedCount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFD700',
        textAlign: 'center',
        marginTop: 12,
    },
    exampleSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'rgba(255, 215, 0, 0.15)',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    exampleText: {
        flex: 1,
        fontSize: 13,
        color: '#FFF',
        lineHeight: 18,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: '#1a5f1a',
        borderTopWidth: 2,
        borderTopColor: '#FFD700',
    },
    saveButton: {
        backgroundColor: '#FF6B35',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        gap: 8,
    },
    saveButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
});
