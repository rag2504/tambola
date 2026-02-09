import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Share,
    Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Prize {
    id: string;
    name: string;
    amount: string;
    category: string;
    enabled: boolean;
}

export default function SharePrizeScreen() {
    const router = useRouter();
    const [prizes, setPrizes] = useState<Prize[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        loadPrizes();
    }, []);

    const loadPrizes = async () => {
        try {
            const prizesData = await AsyncStorage.getItem('selected_prizes');
            if (prizesData) {
                const loadedPrizes = JSON.parse(prizesData);
                setPrizes(loadedPrizes);

                // Calculate total amount
                const total = loadedPrizes.reduce(
                    (sum: number, prize: Prize) => sum + parseInt(prize.amount || '0'),
                    0
                );
                setTotalAmount(total);
            }
        } catch (error) {
            console.error('Error loading prizes:', error);
        }
    };

    const handleShare = async () => {
        try {
            // Create shareable text
            let shareText = '🎉 TAMBOLA PRIZE DISTRIBUTION 🎉\n\n';
            shareText += 'Claims Summary:\n';
            shareText += '─────────────────────\n';

            prizes.forEach((prize, index) => {
                shareText += `${index + 1}. ${prize.name}\n`;
                shareText += `   Prize: ₹${prize.amount}\n\n`;
            });

            shareText += '─────────────────────\n';
            shareText += `Total Prize Pool: ₹${totalAmount}\n\n`;
            shareText += 'Join us for an exciting game of Tambola!';

            const result = await Share.share({
                message: shareText,
                title: 'Tambola Prize Distribution',
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log('Shared with activity type:', result.activityType);
                } else {
                    console.log('Shared successfully');
                }
            } else if (result.action === Share.dismissedAction) {
                console.log('Share dismissed');
            }
        } catch (error) {
            console.error('Error sharing:', error);
            Alert.alert('Error', 'Failed to share prize distribution');
        }
    };

    const renderPrizeItem = (prize: Prize, index: number) => (
        <View key={prize.id} style={styles.prizeItem}>
            <View style={styles.prizeNumber}>
                <Text style={styles.prizeNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.prizeInfo}>
                <Text style={styles.prizeName}>{prize.name}</Text>
                <Text style={styles.prizeCategory}>{prize.category}</Text>
            </View>
            <Text style={styles.prizeAmount}>₹{prize.amount}</Text>
        </View>
    );

    return (
        <LinearGradient colors={['#1a5f1a', '#2d8b2d']} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#FFD700" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Claims Summary</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryHeader}>
                            <MaterialCommunityIcons name="trophy" size={32} color="#FFD700" />
                            <Text style={styles.summaryTitle}>Prize Distribution</Text>
                        </View>

                        <View style={styles.divider} />

                        {prizes.length > 0 ? (
                            <>
                                {prizes.map((prize, index) => renderPrizeItem(prize, index))}

                                <View style={styles.divider} />

                                <View style={styles.totalContainer}>
                                    <Text style={styles.totalLabel}>Total Prize Pool</Text>
                                    <Text style={styles.totalAmount}>₹{totalAmount}</Text>
                                </View>
                            </>
                        ) : (
                            <View style={styles.emptyContainer}>
                                <MaterialCommunityIcons name="alert-circle" size={48} color="#999" />
                                <Text style={styles.emptyText}>No prizes configured</Text>
                                <Text style={styles.emptySubtext}>
                                    Go back and select prizes to continue
                                </Text>
                            </View>
                        )}
                    </View>

                    {prizes.length > 0 && (
                        <TouchableOpacity
                            style={styles.shareButton}
                            onPress={handleShare}
                            activeOpacity={0.8}
                        >
                            <MaterialCommunityIcons name="share-variant" size={24} color="#1a5f1a" />
                            <Text style={styles.shareButtonText}>Share Prize Distribution</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>

                {prizes.length > 0 && (
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.continueButton}
                            onPress={() => router.push('/game')}
                        >
                            <Text style={styles.continueButtonText}>Continue to Game</Text>
                            <MaterialCommunityIcons name="arrow-right" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                )}
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
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    summaryCard: {
        backgroundColor: '#E8E8E8',
        borderRadius: 12,
        padding: 20,
        borderWidth: 2,
        borderColor: '#4A4A4A',
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#4A4A4A',
    },
    divider: {
        height: 2,
        backgroundColor: '#4A4A4A',
        marginVertical: 16,
    },
    prizeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    prizeNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#1a5f1a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    prizeNumberText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
    },
    prizeInfo: {
        flex: 1,
    },
    prizeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4A4A4A',
        marginBottom: 2,
    },
    prizeCategory: {
        fontSize: 13,
        color: '#666',
    },
    prizeAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a5f1a',
    },
    totalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 8,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4A4A4A',
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a5f1a',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
    shareButton: {
        backgroundColor: '#FFD700',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        marginTop: 20,
        gap: 8,
        borderWidth: 2,
        borderColor: '#4A4A4A',
    },
    shareButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a5f1a',
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
    continueButton: {
        backgroundColor: '#FF6B35',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        gap: 8,
    },
    continueButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
});
