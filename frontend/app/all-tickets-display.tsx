import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

interface Ticket {
    id: string;
    ticket_number: number;
    player_id: string;
    player_name: string;
    grid: (number | null)[][];
    numbers: number[];
}

interface PlayerTickets {
    playerName: string;
    tickets: Ticket[];
}

export default function AllTicketsDisplayScreen() {
    const router = useRouter();
    const [playerTickets, setPlayerTickets] = useState<PlayerTickets[]>([]);
    const [loading, setLoading] = useState(true);
    const [capturingPlayer, setCapturingPlayer] = useState<string | null>(null);
    const playerRefs = useRef<{ [key: string]: View | null }>({});

    useEffect(() => {
        loadTickets();
    }, []);

    // Reload tickets whenever screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadTickets();
        }, [])
    );

    const loadTickets = async () => {
        try {
            const ticketsData = await AsyncStorage.getItem('generated_tickets');
            if (ticketsData) {
                const allTickets: Ticket[] = JSON.parse(ticketsData);

                // Group tickets by player
                const grouped: { [key: string]: Ticket[] } = {};
                allTickets.forEach(ticket => {
                    const playerName = ticket.player_name || 'Unknown';
                    if (!grouped[playerName]) {
                        grouped[playerName] = [];
                    }
                    grouped[playerName].push(ticket);
                });

                // Convert to array
                const groupedArray: PlayerTickets[] = Object.entries(grouped).map(([playerName, tickets]) => ({
                    playerName,
                    tickets,
                }));

                setPlayerTickets(groupedArray);
            } else {
                setPlayerTickets([]);
            }
        } catch (error) {
            console.error('Error loading tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const captureAndSharePlayer = async (playerName: string) => {
        const viewRef = playerRefs.current[playerName];
        if (!viewRef) {
            Alert.alert('Error', 'View not ready for capture');
            return;
        }

        try {
            setCapturingPlayer(playerName);

            // Small delay to ensure view is fully rendered
            await new Promise(resolve => setTimeout(resolve, 500));

            // Capture the view as an image
            const uri = await captureRef(viewRef, {
                format: 'png',
                quality: 1,
                result: 'tmpfile',
            });

            console.log('Captured image URI:', uri);

            // Check if sharing is available
            const isAvailable = await Sharing.isAvailableAsync();
            if (!isAvailable) {
                Alert.alert('Error', 'Sharing is not available on this device');
                return;
            }

            // Share the image
            await Sharing.shareAsync(uri, {
                mimeType: 'image/png',
                dialogTitle: `Share ${playerName}'s Tickets`,
            });
        } catch (error) {
            console.error('Error capturing/sharing:', error);
            Alert.alert('Error', `Failed to capture and share tickets: ${error}`);
        } finally {
            setCapturingPlayer(null);
        }
    };

    const renderTicket = (ticket: Ticket) => (
        <View key={ticket.id} style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
                <Text style={styles.ticketHeaderText}>Tambola Book</Text>
                <Text style={styles.ticketNumberText}>
                    {ticket.player_name.toUpperCase()} - {String(ticket.ticket_number).padStart(4, '0')}
                </Text>
            </View>

            <View style={styles.ticketGrid}>
                {ticket.grid.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.gridRow}>
                        {row.map((cell, colIndex) => (
                            <View
                                key={`${rowIndex}-${colIndex}`}
                                style={[
                                    styles.gridCell,
                                    cell !== null && styles.gridCellFilled,
                                ]}
                            >
                                {cell !== null && (
                                    <Text style={styles.gridCellText}>{cell}</Text>
                                )}
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );

    const renderPlayerSection = (playerTicket: PlayerTickets) => (
        <View key={playerTicket.playerName} style={styles.playerSection}>
            <View style={styles.playerHeader}>
                <View>
                    <Text style={styles.playerName}>{playerTicket.playerName.toUpperCase()}</Text>
                    <Text style={styles.playerTicketCount}>
                        {playerTicket.tickets.length} Ticket{playerTicket.tickets.length > 1 ? 's' : ''}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.sharePlayerButton,
                        capturingPlayer === playerTicket.playerName && styles.sharePlayerButtonDisabled
                    ]}
                    onPress={() => captureAndSharePlayer(playerTicket.playerName)}
                    disabled={capturingPlayer === playerTicket.playerName}
                >
                    {capturingPlayer === playerTicket.playerName ? (
                        <ActivityIndicator size="small" color="#1a1a2e" />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="share-variant" size={20} color="#1a1a2e" />
                            <Text style={styles.sharePlayerButtonText}>Share</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <View
                ref={(ref) => { playerRefs.current[playerTicket.playerName] = ref; }}
                style={styles.captureContainer}
                collapsable={false}
            >
                {playerTicket.tickets.map(ticket => renderTicket(ticket))}
            </View>
        </View>
    );

    if (loading) {
        return (
            <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#FFD700" />
                        <Text style={styles.loadingText}>Loading tickets...</Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    if (playerTickets.length === 0) {
        return (
            <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFD700" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>All Tickets</Text>
                        <View style={{ width: 24 }} />
                    </View>
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="ticket-outline" size={80} color="rgba(255,255,255,0.3)" />
                        <Text style={styles.emptyText}>No tickets generated yet</Text>
                        <Text style={styles.emptySubtext}>Add players to generate tickets</Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#FFD700" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>All Tickets</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.infoBox}>
                        <MaterialCommunityIcons name="information" size={20} color="#FFD700" />
                        <Text style={styles.infoText}>
                            Tap "Share" button for each player to capture and share their tickets
                        </Text>
                    </View>

                    {playerTickets.map(playerTicket => renderPlayerSection(playerTicket))}
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#FFD700',
        marginTop: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 8,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        gap: 8,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: '#FFF',
        lineHeight: 16,
    },
    playerSection: {
        marginBottom: 24,
    },
    playerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    playerName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFD700',
    },
    playerTicketCount: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 2,
    },
    sharePlayerButton: {
        backgroundColor: '#FFD700',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        gap: 6,
    },
    sharePlayerButtonDisabled: {
        opacity: 0.6,
    },
    sharePlayerButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1a1a2e',
    },
    captureContainer: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 8,
    },
    ticketCard: {
        backgroundColor: '#E8E4F3',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: '#5B4E8B',
    },
    ticketHeader: {
        backgroundColor: '#5B4E8B',
        padding: 12,
        alignItems: 'center',
    },
    ticketHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 4,
    },
    ticketNumberText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFD700',
    },
    ticketGrid: {
        padding: 8,
    },
    gridRow: {
        flexDirection: 'row',
    },
    gridCell: {
        flex: 1,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#5B4E8B',
        backgroundColor: '#FFF',
    },
    gridCellFilled: {
        backgroundColor: '#E8E4F3',
    },
    gridCellText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2D2D2D',
    },
});
