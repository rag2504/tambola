import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PrizeOption {
    id: string;
    name: string;
    selected: boolean;
    amount: string;
}

const CATEGORY_OPTIONS: { [key: string]: PrizeOption[] } = {
    corners: [
        { id: 'c1', name: '4 Corners', selected: false, amount: '' },
        { id: 'c2', name: 'King Corners', selected: false, amount: '' },
        { id: 'c3', name: 'Queen Corners', selected: false, amount: '' },
        { id: 'c4', name: '4 Corner and Center', selected: false, amount: '' },
        { id: 'c5', name: 'Bulls Eyes', selected: false, amount: '' },
        { id: 'c6', name: 'Twin Lines', selected: false, amount: '' },
        { id: 'c7', name: '6 Corners', selected: false, amount: '' },
        { id: 'c8', name: '6 Corners and Center', selected: false, amount: '' },
        { id: 'c9', name: 'Reverse Twin', selected: false, amount: '' },
    ],
    early: [
        { id: 'e1', name: 'Early 5', selected: false, amount: '' },
        { id: 'e2', name: 'Jaldi 5', selected: false, amount: '' },
        { id: 'e3', name: 'Quickly 7', selected: false, amount: '' },
        { id: 'e4', name: 'Lucky 9', selected: false, amount: '' },
    ],
    rowline: [
        { id: 'r1', name: 'Top Line', selected: false, amount: '' },
        { id: 'r2', name: 'Middle Line', selected: false, amount: '' },
        { id: 'r3', name: 'Bottom Line', selected: false, amount: '' },
        { id: 'r4', name: 'Any Line', selected: false, amount: '' },
        { id: 'r5', name: '2 Lines', selected: false, amount: '' },
    ],
    house: [
        { id: 'h1', name: 'Full House', selected: false, amount: '' },
        { id: 'h2', name: 'Half House', selected: false, amount: '' },
    ],
};

export default function PrizeCategoryDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ categoryId: string; categoryName: string }>();
    const [options, setOptions] = useState<PrizeOption[]>(
        CATEGORY_OPTIONS[params.categoryId] || []
    );
    const [showAmountModal, setShowAmountModal] = useState(false);
    const [selectedOption, setSelectedOption] = useState<PrizeOption | null>(null);
    const [tempAmount, setTempAmount] = useState('');

    const toggleOption = (option: PrizeOption) => {
        if (!option.selected) {
            // Show amount modal when selecting
            setSelectedOption(option);
            setTempAmount(option.amount || '');
            setShowAmountModal(true);
        } else {
            // Deselect
            setOptions(prev =>
                prev.map(opt => (opt.id === option.id ? { ...opt, selected: false, amount: '' } : opt))
            );
        }
    };

    const saveAmount = () => {
        if (!tempAmount || parseInt(tempAmount) <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid prize amount');
            return;
        }

        if (selectedOption) {
            setOptions(prev =>
                prev.map(opt =>
                    opt.id === selectedOption.id
                        ? { ...opt, selected: true, amount: tempAmount }
                        : opt
                )
            );
        }

        setShowAmountModal(false);
        setSelectedOption(null);
        setTempAmount('');
    };

    const saveSelection = async () => {
        const selectedPrizes = options.filter(opt => opt.selected);

        if (selectedPrizes.length === 0) {
            Alert.alert('No Selection', 'Please select at least one prize');
            return;
        }

        try {
            // Save to AsyncStorage
            const prizesData = await AsyncStorage.getItem('selected_prizes');
            const allPrizes = prizesData ? JSON.parse(prizesData) : [];

            // Remove old prizes from this category
            const otherPrizes = allPrizes.filter(
                (p: any) => !p.id.startsWith(params.categoryId.charAt(0))
            );

            // Add new selected prizes
            const newPrizes = selectedPrizes.map(opt => ({
                id: opt.id,
                name: opt.name,
                amount: opt.amount,
                category: params.categoryName,
                enabled: true,
            }));

            await AsyncStorage.setItem(
                'selected_prizes',
                JSON.stringify([...otherPrizes, ...newPrizes])
            );

            router.back();
        } catch (error) {
            console.error('Error saving prizes:', error);
            Alert.alert('Error', 'Failed to save prize selection');
        }
    };

    const renderOption = ({ item }: { item: PrizeOption }) => (
        <TouchableOpacity
            style={styles.optionCard}
            onPress={() => toggleOption(item)}
            activeOpacity={0.7}
        >
            <MaterialCommunityIcons
                name={item.selected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={24}
                color={item.selected ? '#1a5f1a' : '#999'}
            />
            <View style={styles.optionInfo}>
                <Text style={styles.optionName}>{item.name}</Text>
                {item.selected && item.amount && (
                    <Text style={styles.optionAmount}>₹{item.amount}</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <LinearGradient colors={['#1a5f1a', '#2d8b2d']} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#FFD700" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{params.categoryName}</Text>
                    <View style={{ width: 24 }} />
                </View>

                <FlatList
                    data={options}
                    renderItem={renderOption}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                />

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={saveSelection}
                    >
                        <Text style={styles.saveButtonText}>Save Selection</Text>
                        <MaterialCommunityIcons name="check" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Amount Input Modal */}
                <Modal
                    visible={showAmountModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowAmountModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Set Prize Amount</Text>
                            <Text style={styles.modalSubtitle}>{selectedOption?.name}</Text>

                            <TextInput
                                style={styles.amountInput}
                                value={tempAmount}
                                onChangeText={setTempAmount}
                                keyboardType="numeric"
                                placeholder="Enter amount"
                                placeholderTextColor="#999"
                                autoFocus
                            />

                            <Text style={styles.exampleText}>Example: 100, 250, 2000 etc.</Text>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.exitButton]}
                                    onPress={() => {
                                        setShowAmountModal(false);
                                        setSelectedOption(null);
                                        setOptions(prev =>
                                            prev.map(opt => (opt.id === selectedOption?.id ? { ...opt, selected: false, amount: '' } : opt))
                                        );
                                        setTempAmount('');
                                    }}
                                >
                                    <Text style={styles.exitButtonText}>EXIT</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.saveModalButton]}
                                    onPress={saveAmount}
                                >
                                    <Text style={styles.saveModalButtonText}>SAVE</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
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
    listContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    optionCard: {
        backgroundColor: '#E8E8E8',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 2,
        borderColor: '#4A4A4A',
    },
    optionInfo: {
        flex: 1,
    },
    optionName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#4A4A4A',
    },
    optionAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a5f1a',
        marginTop: 4,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#E8E8E8',
        borderRadius: 12,
        padding: 24,
        width: '90%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4A4A4A',
        textAlign: 'center',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a5f1a',
        textAlign: 'center',
        marginBottom: 20,
    },
    amountInput: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#4A4A4A',
        padding: 16,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4A4A4A',
        textAlign: 'center',
        marginBottom: 12,
    },
    exampleText: {
        fontSize: 14,
        color: '#1a5f1a',
        textAlign: 'center',
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    exitButton: {
        backgroundColor: '#FF4444',
    },
    exitButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
    },
    saveModalButton: {
        backgroundColor: '#1a5f1a',
    },
    saveModalButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
    },
});
