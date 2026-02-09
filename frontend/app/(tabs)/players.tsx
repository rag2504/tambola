import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { generateTicketsForPlayers } from '../../utils/ticketGenerator';
import { useGameState } from '../../contexts/GameStateContext';

interface Player {
  id: string;
  name: string;
  ticket_count: number;
  created_at: string;
}

export default function PlayersScreen() {
  const router = useRouter();
  const { resetGame } = useGameState();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [editPlayerName, setEditPlayerName] = useState('');
  const [editPlayerTicketCount, setEditPlayerTicketCount] = useState(1);
  const [newPlayerTicketCount, setNewPlayerTicketCount] = useState(1);
  const [ticketCounts, setTicketCounts] = useState<{ [key: string]: number }>({});
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const fetchPlayers = useCallback(async () => {
    try {
      // Load players from AsyncStorage (offline)
      const playersData = await AsyncStorage.getItem('players');
      const loadedPlayers: Player[] = playersData ? JSON.parse(playersData) : [];
      setPlayers(loadedPlayers);

      // Load ticket counts from AsyncStorage
      const counts: { [key: string]: number } = {};
      for (const player of loadedPlayers) {
        const saved = await AsyncStorage.getItem(`ticket_count_${player.id}`);
        counts[player.id] = saved ? parseInt(saved) : 1;
      }
      setTicketCounts(counts);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const handleAddPlayer = async () => {
    if (!playerName.trim()) {
      Alert.alert('Error', 'Please enter a player name');
      return;
    }

    // Check for duplicate name
    const trimmedName = playerName.trim();
    const isDuplicate = players.some(p => p.name.toLowerCase() === trimmedName.toLowerCase());
    if (isDuplicate) {
      Alert.alert('Error', 'A player with this name already exists. Please use a different name.');
      return;
    }

    try {
      // Create player offline
      const newPlayer: Player = {
        id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: playerName.trim(),
        ticket_count: newPlayerTicketCount,
        created_at: new Date().toISOString(),
      };

      const updatedPlayers = [...players, newPlayer];
      setPlayers(updatedPlayers);
      setTicketCounts({ ...ticketCounts, [newPlayer.id]: newPlayerTicketCount });

      // Save to AsyncStorage
      await AsyncStorage.setItem('players', JSON.stringify(updatedPlayers));
      await AsyncStorage.setItem(`ticket_count_${newPlayer.id}`, newPlayerTicketCount.toString());

      setPlayerName('');
      setNewPlayerTicketCount(1);
      setModalVisible(false);

      // Regenerate tickets immediately with updated players
      await regenerateTickets(updatedPlayers, { ...ticketCounts, [newPlayer.id]: newPlayerTicketCount });
    } catch (error) {
      console.error('Error adding player:', error);
      Alert.alert('Error', 'Failed to add player');
    }
  };

  // Regenerate tickets for all players
  const regenerateTickets = async (currentPlayers?: Player[], currentTicketCounts?: { [key: string]: number }) => {
    try {
      const playersToUse = currentPlayers || players;
      const countsToUse = currentTicketCounts || ticketCounts;

      if (playersToUse.length === 0) {
        // No players, clear tickets
        await AsyncStorage.setItem('generated_tickets', JSON.stringify([]));
        return;
      }

      // Generate fresh tickets for all players
      const tickets = generateTicketsForPlayers(playersToUse, countsToUse);
      await AsyncStorage.setItem('generated_tickets', JSON.stringify(tickets));
      console.log(`Regenerated ${tickets.length} tickets for ${playersToUse.length} players`);
    } catch (error) {
      console.error('Error regenerating tickets:', error);
    }
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setEditPlayerName(player.name);
    setEditPlayerTicketCount(ticketCounts[player.id] || 1);
    setEditModalVisible(true);
  };

  const handleUpdatePlayer = async () => {
    if (!editPlayerName.trim()) {
      Alert.alert('Error', 'Please enter a player name');
      return;
    }

    if (!editingPlayer) return;

    // Check for duplicate name (excluding current player)
    const trimmedName = editPlayerName.trim();
    const isDuplicate = players.some(p =>
      p.id !== editingPlayer.id && p.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      Alert.alert('Error', 'A player with this name already exists. Please use a different name.');
      return;
    }

    try {
      const oldName = editingPlayer.name;
      const newName = trimmedName;

      // Update player in the list
      const updatedPlayers = players.map(p =>
        p.id === editingPlayer.id
          ? { ...p, name: newName }
          : p
      );
      setPlayers(updatedPlayers);

      // Update ticket count
      setTicketCounts({ ...ticketCounts, [editingPlayer.id]: editPlayerTicketCount });

      // Save to AsyncStorage
      await AsyncStorage.setItem('players', JSON.stringify(updatedPlayers));
      await AsyncStorage.setItem(`ticket_count_${editingPlayer.id}`, editPlayerTicketCount.toString());

      // Regenerate all tickets with updated player data
      await regenerateTickets(updatedPlayers, { ...ticketCounts, [editingPlayer.id]: editPlayerTicketCount });

      setEditModalVisible(false);
      setEditingPlayer(null);
      setEditPlayerName('');
      setEditPlayerTicketCount(1);
    } catch (error) {
      console.error('Error updating player:', error);
      Alert.alert('Error', 'Failed to update player');
    }
  };

  const handleDeletePlayer = async (player: Player) => {
    Alert.alert(
      'Delete Player',
      `Are you sure you want to delete ${player.name}? This will also delete all their tickets.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedPlayers = players.filter((p) => p.id !== player.id);
              setPlayers(updatedPlayers);
              await AsyncStorage.setItem('players', JSON.stringify(updatedPlayers));
              await AsyncStorage.removeItem(`ticket_count_${player.id}`);

              // Regenerate tickets for remaining players
              await regenerateTickets(updatedPlayers, ticketCounts);
            } catch (error) {
              console.error('Error deleting player:', error);
            }
          },
        },
      ]
    );
  };

  const togglePlayerSelection = (playerId: string) => {
    const newSelected = new Set(selectedPlayers);
    if (newSelected.has(playerId)) {
      newSelected.delete(playerId);
    } else {
      newSelected.add(playerId);
    }
    setSelectedPlayers(newSelected);
    setSelectAll(newSelected.size === players.length && players.length > 0);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedPlayers(new Set());
      setSelectAll(false);
    } else {
      setSelectedPlayers(new Set(players.map(p => p.id)));
      setSelectAll(true);
    }
  };

  const updateTicketCount = async (playerId: string, count: number) => {
    const newCount = Math.max(1, Math.min(100, count));
    setTicketCounts({ ...ticketCounts, [playerId]: newCount });
    await AsyncStorage.setItem(`ticket_count_${playerId}`, newCount.toString());
  };

  const shareAllTickets = async () => {
    try {
      // Load all generated tickets to check if they exist
      const ticketsData = await AsyncStorage.getItem('generated_tickets');
      if (!ticketsData) {
        Alert.alert('No Tickets', 'Please generate tickets first by starting a game');
        return;
      }

      const allTickets = JSON.parse(ticketsData);
      if (allTickets.length === 0) {
        Alert.alert('No Tickets', 'No tickets have been generated yet');
        return;
      }

      // Navigate to visual tickets display screen
      router.push('/all-tickets-display' as any);
    } catch (error) {
      console.error('Error loading tickets:', error);
      Alert.alert('Error', 'Failed to load tickets');
    }
  };

  const handleStartGame = async () => {
    if (players.length === 0) {
      Alert.alert('Error', 'Please add at least one player');
      return;
    }

    // Start fresh every time a new game is started
    await resetGame();
    await AsyncStorage.multiRemove(['game_state', 'generated_tickets', 'admin_selected_ticket', 'claims']);

    // Save game data to AsyncStorage
    const gameData = {
      players: players.map(p => ({ id: p.id, name: p.name })),
      ticketCounts,
    };
    await AsyncStorage.setItem('current_game', JSON.stringify(gameData));

    // Navigate to prize configuration first
    router.push('/prize-config');
  };

  const viewPlayerTickets = (player: Player) => {
    router.push({
      pathname: '/player-tickets',
      params: {
        playerId: player.id,
        playerName: player.name,
      },
    });
  };

  const renderPlayer = ({ item, index }: { item: Player; index: number }) => {
    const ticketCount = ticketCounts[item.id] || 1;
    const ticketStart = index === 0 ? 1 : players.slice(0, index).reduce((sum, p) => sum + (ticketCounts[p.id] || 1), 0) + 1;
    const ticketEnd = ticketStart + ticketCount - 1;
    const isSelected = selectedPlayers.has(item.id);

    return (
      <View style={styles.playerCard}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => togglePlayerSelection(item.id)}
        >
          <MaterialCommunityIcons
            name={isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
            size={24}
            color={isSelected ? "#FFD700" : "#999"}
          />
        </TouchableOpacity>

        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{index + 1}. {item.name}</Text>
          <Text style={styles.playerMeta}>
            {ticketCount} Ticket{ticketCount > 1 ? 's' : ''} ({ticketStart} - {ticketEnd})
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditPlayer(item)}
          >
            <MaterialCommunityIcons name="pencil" size={20} color="#FFD700" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeletePlayer(item)}
          >
            <MaterialCommunityIcons name="delete" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#1a5f1a', '#2d8b2d']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manage Players</Text>
          <Text style={styles.headerSubtitle}>
            {players.length} player(s) added
          </Text>
        </View>

        {players.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-off" size={80} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyText}>No players added yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first player</Text>
          </View>
        ) : (
          <>
            <View style={styles.selectAllContainer}>
              <TouchableOpacity
                style={styles.selectAllButton}
                onPress={toggleSelectAll}
              >
                <MaterialCommunityIcons
                  name={selectAll ? "checkbox-marked" : "checkbox-blank-outline"}
                  size={24}
                  color={selectAll ? "#FFD700" : "#999"}
                />
                <Text style={styles.selectAllText}>Select All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={players}
              renderItem={renderPlayer}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
            />
          </>
        )}

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#1a5f1a" />
            <Text style={styles.addButtonText}>Add Player</Text>
          </TouchableOpacity>

          {players.length > 0 && (
            <>
              <TouchableOpacity
                style={styles.shareAllButton}
                onPress={shareAllTickets}
              >
                <MaterialCommunityIcons name="share-variant" size={24} color="#1a5f1a" />
                <Text style={styles.shareAllButtonText}>Share Links</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
                <Text style={styles.startButtonText}>Start Game</Text>
                <MaterialCommunityIcons name="play" size={24} color="#FFF" />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Add Player Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New Player</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter player name"
                placeholderTextColor="#999"
                value={playerName}
                onChangeText={setPlayerName}
                autoFocus
              />

              <View style={styles.ticketSelectorContainer}>
                <Text style={styles.ticketSelectorLabel}>Number of Tickets</Text>
                <View style={styles.ticketSelectorControls}>
                  <TouchableOpacity
                    style={styles.ticketSelectorButton}
                    onPress={() => setNewPlayerTicketCount(Math.max(1, newPlayerTicketCount - 1))}
                  >
                    <MaterialCommunityIcons name="minus" size={24} color="#1a5f1a" />
                  </TouchableOpacity>
                  <Text style={styles.ticketSelectorCount}>{newPlayerTicketCount}</Text>
                  <TouchableOpacity
                    style={styles.ticketSelectorButton}
                    onPress={() => setNewPlayerTicketCount(Math.min(100, newPlayerTicketCount + 1))}
                  >
                    <MaterialCommunityIcons name="plus" size={24} color="#1a5f1a" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setModalVisible(false);
                    setPlayerName('');
                    setNewPlayerTicketCount(1);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleAddPlayer}
                >
                  <Text style={styles.confirmButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Edit Player Modal */}
        <Modal
          visible={editModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setEditModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Player</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter player name"
                placeholderTextColor="#999"
                value={editPlayerName}
                onChangeText={setEditPlayerName}
                autoFocus
              />

              <View style={styles.ticketSelectorContainer}>
                <Text style={styles.ticketSelectorLabel}>Number of Tickets</Text>
                <View style={styles.ticketSelectorControls}>
                  <TouchableOpacity
                    style={styles.ticketSelectorButton}
                    onPress={() => setEditPlayerTicketCount(Math.max(1, editPlayerTicketCount - 1))}
                  >
                    <MaterialCommunityIcons name="minus" size={24} color="#1a5f1a" />
                  </TouchableOpacity>
                  <Text style={styles.ticketSelectorCount}>{editPlayerTicketCount}</Text>
                  <TouchableOpacity
                    style={styles.ticketSelectorButton}
                    onPress={() => setEditPlayerTicketCount(Math.min(100, editPlayerTicketCount + 1))}
                  >
                    <MaterialCommunityIcons name="plus" size={24} color="#1a5f1a" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setEditModalVisible(false);
                    setEditingPlayer(null);
                    setEditPlayerName('');
                    setEditPlayerTicketCount(1);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleUpdatePlayer}
                >
                  <Text style={styles.confirmButtonText}>Update</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a5f1a',
  },
  header: {
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFF',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  playerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
    gap: 12,
  },
  checkbox: {
    padding: 4,
  },
  selectAllContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.3)',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  playerMeta: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#1a5f1a',
    borderTopWidth: 2,
    borderTopColor: '#FFD700',
    gap: 12,
  },
  addButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a5f1a',
  },
  startButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  shareAllButton: {
    backgroundColor: '#4ECDC4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  shareAllButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a5f1a',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a5f1a',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
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
  cancelButton: {
    backgroundColor: '#DDD',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  confirmButton: {
    backgroundColor: '#1a5f1a',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  ticketSelectorContainer: {
    marginBottom: 16,
  },
  ticketSelectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  ticketSelectorControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  ticketSelectorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a5f1a',
  },
  ticketSelectorCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a5f1a',
    minWidth: 60,
    textAlign: 'center',
  },
});
