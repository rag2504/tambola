import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { roomAPI, ticketAPI, gameAPI } from '../../../services/api';
import { socketService } from '../../../services/socket';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get('window');

interface Ticket {
  id: string;
  ticket_number: number;
  grid: (number | null)[][];
  numbers: number[];
  marked_numbers: number[];
}

interface Room {
  id: string;
  name: string;
  host_id: string;
  called_numbers: number[];
  current_number: number | null;
  prizes: Array<{
    prize_type: string;
    amount: number;
  }>;
}

export default function LiveGameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [autoCall, setAutoCall] = useState(false);
  const autoCallInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadGameData();
    setupSocketListeners();

    return () => {
      cleanupSocketListeners();
      if (autoCallInterval.current) {
        clearInterval(autoCallInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (room?.current_number) {
      Speech.speak(String(room.current_number), { rate: 0.9 });
    }
  }, [room?.current_number]);

  const loadGameData = async () => {
    try {
      const roomData = await roomAPI.getRoom(params.id);
      setRoom(roomData);

      // Load user's tickets (mock for now - will be from API)
      // TODO: Replace with actual API call
      const mockTickets: Ticket[] = [
        {
          id: '1',
          ticket_number: 1,
          grid: generateMockTicket(),
          numbers: [],
          marked_numbers: [],
        },
      ];
      setTickets(mockTickets);
      setSelectedTicket(mockTickets[0]);
    } catch (error) {
      console.error('Error loading game:', error);
    }
  };

  const generateMockTicket = (): (number | null)[][] => {
    // Simple mock ticket generation
    const ticket: (number | null)[][] = [
      [1, null, 23, null, 45, null, 67, null, 89],
      [null, 12, null, 34, null, 56, null, 78, null],
      [5, null, 27, null, 49, null, 61, null, 83],
    ];
    return ticket;
  };

  const setupSocketListeners = () => {
    socketService.on('number_called', handleNumberCalled);
    socketService.on('prize_claimed', handlePrizeClaimed);
    socketService.on('winner_announced', handleWinnerAnnounced);
  };

  const cleanupSocketListeners = () => {
    socketService.off('number_called');
    socketService.off('prize_claimed');
    socketService.off('winner_announced');
  };

  const handleNumberCalled = (data: any) => {
    console.log('Number called:', data);
    setRoom((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        current_number: data.number,
        called_numbers: data.called_numbers,
      };
    });

    // Auto-mark on tickets
    autoMarkNumber(data.number);
  };

  const handlePrizeClaimed = (data: any) => {
    console.log('Prize claimed:', data);
    Alert.alert('Prize Claimed!', `${data.user_name} claimed ${data.prize_type}`);
  };

  const handleWinnerAnnounced = (data: any) => {
    console.log('Winner announced:', data);
    Alert.alert(
      '🎉 Winner! 🎉',
      `${data.winner_name} won ${data.prize_type} - ₹${data.amount}!`
    );
  };

  const autoMarkNumber = (number: number) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) => {
        const hasNumber = ticket.grid.some((row) => row.includes(number));
        if (hasNumber && !ticket.marked_numbers.includes(number)) {
          return {
            ...ticket,
            marked_numbers: [...ticket.marked_numbers, number],
          };
        }
        return ticket;
      })
    );
  };

  const handleCallNumber = () => {
    if (!room) return;
    socketService.callNumber(params.id);
  };

  const toggleAutoCall = () => {
    if (autoCall) {
      if (autoCallInterval.current) {
        clearInterval(autoCallInterval.current);
        autoCallInterval.current = null;
      }
      setAutoCall(false);
    } else {
      handleCallNumber(); // Call first number immediately
      autoCallInterval.current = setInterval(() => {
        handleCallNumber();
      }, 5000); // Every 5 seconds
      setAutoCall(true);
    }
  };

  const handleManualMark = (number: number) => {
    if (!selectedTicket) return;

    setTickets((prevTickets) =>
      prevTickets.map((ticket) => {
        if (ticket.id === selectedTicket.id) {
          const isMarked = ticket.marked_numbers.includes(number);
          return {
            ...ticket,
            marked_numbers: isMarked
              ? ticket.marked_numbers.filter((n) => n !== number)
              : [...ticket.marked_numbers, number],
          };
        }
        return ticket;
      })
    );

    setSelectedTicket((prev) => {
      if (!prev) return prev;
      const isMarked = prev.marked_numbers.includes(number);
      return {
        ...prev,
        marked_numbers: isMarked
          ? prev.marked_numbers.filter((n) => n !== number)
          : [...prev.marked_numbers, number],
      };
    });
  };

  const checkWin = (prizeType: string): boolean => {
    if (!selectedTicket || !room) return false;

    const grid = selectedTicket.grid;
    const marked = selectedTicket.marked_numbers;

    switch (prizeType) {
      case 'early_five':
        return marked.length >= 5;

      case 'top_line':
        const topLine = grid[0].filter((n) => n !== null);
        return topLine.every((n) => marked.includes(n!));

      case 'middle_line':
        const middleLine = grid[1].filter((n) => n !== null);
        return middleLine.every((n) => marked.includes(n!));

      case 'bottom_line':
        const bottomLine = grid[2].filter((n) => n !== null);
        return bottomLine.every((n) => marked.includes(n!));

      case 'four_corners':
        const corners = [
          grid[0].find((n) => n !== null),
          grid[0].reverse().find((n) => n !== null),
          grid[2].find((n) => n !== null),
          grid[2].reverse().find((n) => n !== null),
        ].filter((n) => n !== null);
        grid[0].reverse();
        grid[2].reverse();
        return corners.every((n) => marked.includes(n!));

      case 'full_house':
        const allNumbers = grid.flat().filter((n) => n !== null);
        return allNumbers.every((n) => marked.includes(n!));

      default:
        return false;
    }
  };

  const handleClaimPrize = (prizeType: string) => {
    if (!selectedTicket || !room) return;

    if (!checkWin(prizeType)) {
      Alert.alert('Invalid Claim', 'You have not completed this pattern yet');
      return;
    }

    socketService.claimPrize(params.id, selectedTicket.id, prizeType);
    setShowClaimModal(false);
    Alert.alert('Claim Submitted', 'Your claim is being verified...');
  };

  const renderNumberGrid = () => {
    if (!room) return null;

    const numbers = Array.from({ length: 90 }, (_, i) => i + 1);
    const rows = [];
    for (let i = 0; i < 9; i++) {
      rows.push(numbers.slice(i * 10, (i + 1) * 10));
    }

    return (
      <View style={styles.numberGrid}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numberRow}>
            {row.map((num) => (
              <View
                key={num}
                style={[
                  styles.numberCell,
                  room.called_numbers.includes(num) && styles.numberCellCalled,
                  room.current_number === num && styles.numberCellCurrent,
                ]}
              >
                <Text
                  style={[
                    styles.numberText,
                    room.called_numbers.includes(num) && styles.numberTextCalled,
                  ]}
                >
                  {num}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderTicket = (ticket: Ticket) => {
    return (
      <View style={styles.ticketCard}>
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketNumber}>
            Ticket #{String(ticket.ticket_number).padStart(4, '0')}
          </Text>
          <TouchableOpacity
            style={styles.claimButton}
            onPress={() => setShowClaimModal(true)}
          >
            <MaterialCommunityIcons name="trophy" size={20} color="#FFD700" />
            <Text style={styles.claimButtonText}>Claim</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.ticketGrid}>
          {ticket.grid.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.ticketRow}>
              {row.map((cell, colIndex) => (
                <TouchableOpacity
                  key={`${rowIndex}-${colIndex}`}
                  style={[
                    styles.ticketCell,
                    cell !== null && styles.ticketCellFilled,
                    cell !== null &&
                      ticket.marked_numbers.includes(cell) &&
                      styles.ticketCellMarked,
                    cell === room?.current_number && styles.ticketCellCurrent,
                  ]}
                  onPress={() => cell !== null && handleManualMark(cell)}
                  disabled={cell === null}
                >
                  {cell !== null && (
                    <Text
                      style={[
                        styles.ticketCellText,
                        ticket.marked_numbers.includes(cell) &&
                          styles.ticketCellTextMarked,
                      ]}
                    >
                      {cell}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const isHost = user?.id === room?.host_id;

  if (!room) {
    return (
      <LinearGradient colors={['#1a5f1a', '#2d8b2d']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading game...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1a5f1a', '#2d8b2d']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFD700" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{room.name}</Text>
          <View style={styles.headerRight}>
            <Text style={styles.calledCount}>{room.called_numbers.length}/90</Text>
            <TouchableOpacity onPress={() => setShowTicketModal(true)}>
              <MaterialCommunityIcons name="ticket" size={24} color="#FFD700" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Current Number */}
          <View style={styles.currentNumberContainer}>
            <Text style={styles.currentNumberLabel}>Current Number</Text>
            <View style={styles.currentNumberCircle}>
              <Text style={styles.currentNumberText}>
                {room.current_number || '--'}
              </Text>
            </View>
          </View>

          {/* Host Controls */}
          {isHost && (
            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleCallNumber}
                disabled={autoCall}
              >
                <MaterialCommunityIcons name="hand-pointing-right" size={24} color="#FFF" />
                <Text style={styles.controlButtonText}>Call Number</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.controlButton,
                  autoCall ? styles.stopButton : styles.autoButton,
                ]}
                onPress={toggleAutoCall}
              >
                <MaterialCommunityIcons
                  name={autoCall ? 'stop' : 'play'}
                  size={24}
                  color="#FFF"
                />
                <Text style={styles.controlButtonText}>
                  {autoCall ? 'Stop Auto' : 'Auto Mode'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Number Board */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Called Numbers</Text>
            {renderNumberGrid()}
          </View>

          {/* My Ticket */}
          {selectedTicket && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My Ticket</Text>
              {renderTicket(selectedTicket)}
            </View>
          )}
        </ScrollView>

        {/* Claim Prize Modal */}
        <Modal
          visible={showClaimModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowClaimModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Claim Prize</Text>
              <Text style={styles.modalSubtitle}>Select the prize you want to claim</Text>

              <ScrollView style={styles.prizeList}>
                {room.prizes.map((prize) => (
                  <TouchableOpacity
                    key={prize.prize_type}
                    style={[
                      styles.prizeOption,
                      checkWin(prize.prize_type) && styles.prizeOptionAvailable,
                    ]}
                    onPress={() => handleClaimPrize(prize.prize_type)}
                    disabled={!checkWin(prize.prize_type)}
                  >
                    <MaterialCommunityIcons
                      name="trophy"
                      size={24}
                      color={checkWin(prize.prize_type) ? '#FFD700' : '#999'}
                    />
                    <View style={styles.prizeOptionInfo}>
                      <Text
                        style={[
                          styles.prizeOptionName,
                          !checkWin(prize.prize_type) && styles.prizeOptionDisabled,
                        ]}
                      >
                        {prize.prize_type.replace('_', ' ').toUpperCase()}
                      </Text>
                      <Text style={styles.prizeOptionAmount}>₹{prize.amount}</Text>
                    </View>
                    {checkWin(prize.prize_type) && (
                      <MaterialCommunityIcons name="check-circle" size={24} color="#4ECDC4" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowClaimModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* All Tickets Modal */}
        <Modal
          visible={showTicketModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTicketModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>My Tickets</Text>
              <FlatList
                data={tickets}
                renderItem={({ item }) => renderTicket(item)}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.ticketsList}
              />
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowTicketModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFD700',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  calledCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  content: {
    padding: 16,
  },
  currentNumberContainer: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  currentNumberLabel: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 12,
    fontWeight: '600',
  },
  currentNumberCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
  },
  currentNumberText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1a5f1a',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FF6B35',
    gap: 8,
  },
  autoButton: {
    backgroundColor: '#4ECDC4',
  },
  stopButton: {
    backgroundColor: '#FF4444',
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 12,
  },
  numberGrid: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 4,
  },
  numberRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 2,
  },
  numberCell: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberCellCalled: {
    backgroundColor: '#4ECDC4',
  },
  numberCellCurrent: {
    backgroundColor: '#FF6B35',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  numberText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  numberTextCalled: {
    color: '#FFF',
  },
  ticketCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a5f1a',
    padding: 12,
  },
  ticketNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  claimButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  ticketGrid: {
    padding: 8,
  },
  ticketRow: {
    flexDirection: 'row',
  },
  ticketCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#DDD',
  },
  ticketCellFilled: {
    backgroundColor: '#FFD700',
  },
  ticketCellMarked: {
    backgroundColor: '#4ECDC4',
  },
  ticketCellCurrent: {
    backgroundColor: '#FF6B35',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  ticketCellText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a5f1a',
  },
  ticketCellTextMarked: {
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a5f1a',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  prizeList: {
    maxHeight: 400,
  },
  prizeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginBottom: 12,
    gap: 12,
  },
  prizeOptionAvailable: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  prizeOptionInfo: {
    flex: 1,
  },
  prizeOptionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a5f1a',
  },
  prizeOptionDisabled: {
    color: '#999',
  },
  prizeOptionAmount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  ticketsList: {
    paddingBottom: 16,
  },
  modalCloseButton: {
    backgroundColor: '#1a5f1a',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
});
