import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGameState } from '../contexts/GameStateContext';

interface Claim {
  id: string;
  prizeId: string;
  prizeName: string;
  prizeAmount: string;
  playerId: string;
  playerName: string;
  ticketId: string;
  ticketNumber: number;
  timestamp: string;
  status: 'pending' | 'verified' | 'rejected';
  autoVerified: boolean;
}

export default function ClaimsScreen() {
  const router = useRouter();
  const { gameState } = useGameState();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');

  useEffect(() => {
    loadClaims();
  }, [gameState.claims]);

  const loadClaims = async () => {
    try {
      // Use claims from GameStateContext
      const gameClaims = gameState.claims.map(c => ({
        id: c.id,
        prizeId: c.prize_id,
        prizeName: c.prize_name,
        prizeAmount: '', // Amount not stored in claim
        playerId: c.player_id,
        playerName: c.player_name,
        ticketId: c.ticket_id,
        ticketNumber: c.ticket_number,
        timestamp: c.timestamp,
        status: c.verified ? 'verified' as const : 'pending' as const,
        autoVerified: c.verified,
      }));
      setClaims(gameClaims);
    } catch (error) {
      console.error('Error loading claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyClaim = async (claimId: string, approve: boolean) => {
    try {
      const updated = claims.map(c =>
        c.id === claimId ? { ...c, status: (approve ? 'verified' : 'rejected') as 'pending' | 'verified' | 'rejected' } : c
      );
      setClaims(updated);

      Alert.alert('Success', approve ? 'Claim verified!' : 'Claim rejected');
    } catch (error) {
      console.error('Error updating claim:', error);
      Alert.alert('Error', 'Failed to update claim status');
    }
  };

  const shareSummary = async () => {
    const verifiedClaims = claims.filter(c => c.status === 'verified');
    if (verifiedClaims.length === 0) {
      Alert.alert('No Winners', 'No verified claims to share');
      return;
    }

    let message = '🎉 TAMBOLA WINNERS 🎉\n\n';
    verifiedClaims.forEach(claim => {
      message += `🏆 ${claim.prizeName}\n`;
      message += `   Winner: ${claim.playerName}\n`;
      message += `   Ticket: #${String(claim.ticketNumber).padStart(4, '0')}\n`;
      message += `   Prize: ₹${claim.prizeAmount}\n\n`;
    });

    const totalPrizes = verifiedClaims.reduce((sum, c) => sum + parseInt(c.prizeAmount), 0);
    message += `💰 Total Prizes Awarded: ₹${totalPrizes.toLocaleString()}`;

    try {
      await Share.share({ message });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share winners');
    }
  };

  const filteredClaims = claims.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'pending') return c.status === 'pending';
    if (filter === 'verified') return c.status === 'verified';
    return true;
  });

  const renderClaim = (claim: Claim) => {
    const isPending = claim.status === 'pending';
    const isVerified = claim.status === 'verified';
    const isRejected = claim.status === 'rejected';

    return (
      <View
        key={claim.id}
        style={[
          styles.claimCard,
          isVerified && styles.claimCardVerified,
          isRejected && styles.claimCardRejected,
        ]}
      >
        <View style={styles.claimHeader}>
          <View style={styles.claimInfo}>
            <Text style={styles.claimPrize}>{claim.prizeName}</Text>
            <Text style={styles.claimPlayer}>{claim.playerName}</Text>
            <Text style={styles.claimTicket}>
              Ticket #{String(claim.ticketNumber).padStart(4, '0')}
            </Text>
          </View>
          <View style={styles.claimAmount}>
            <Text style={styles.claimAmountText}>₹{claim.prizeAmount}</Text>
            {claim.autoVerified && (
              <View style={styles.autoVerifiedBadge}>
                <MaterialCommunityIcons name="check-decagram" size={16} color="#4ECDC4" />
                <Text style={styles.autoVerifiedText}>Auto</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.claimFooter}>
          <Text style={styles.claimTime}>
            {new Date(claim.timestamp).toLocaleString()}
          </Text>
          {isPending && (
            <View style={styles.claimActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => verifyClaim(claim.id, false)}
              >
                <MaterialCommunityIcons name="close" size={20} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => verifyClaim(claim.id, true)}
              >
                <MaterialCommunityIcons name="check" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
          {isVerified && (
            <View style={styles.statusBadge}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#4ECDC4" />
              <Text style={styles.statusText}>Verified</Text>
            </View>
          )}
          {isRejected && (
            <View style={[styles.statusBadge, styles.rejectedBadge]}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#FF4444" />
              <Text style={[styles.statusText, styles.rejectedText]}>Rejected</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const pendingCount = claims.filter(c => c.status === 'pending').length;
  const verifiedCount = claims.filter(c => c.status === 'verified').length;

  return (
    <LinearGradient colors={['#1a5f1a', '#2d8b2d']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFD700" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Claims & Winners</Text>
          <TouchableOpacity onPress={shareSummary}>
            <MaterialCommunityIcons name="share-variant" size={24} color="#FFD700" />
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All ({claims.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
            onPress={() => setFilter('pending')}
          >
            <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
              Pending ({pendingCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'verified' && styles.filterButtonActive]}
            onPress={() => setFilter('verified')}
          >
            <Text style={[styles.filterText, filter === 'verified' && styles.filterTextActive]}>
              Verified ({verifiedCount})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {filteredClaims.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="trophy-outline" size={80} color="rgba(255,255,255,0.3)" />
              <Text style={styles.emptyText}>No claims yet</Text>
              <Text style={styles.emptySubtext}>
                Claims will appear here when players win prizes
              </Text>
            </View>
          ) : (
            filteredClaims.map(renderClaim)
          )}
        </ScrollView>
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#FFD700',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  filterTextActive: {
    color: '#1a5f1a',
  },
  content: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
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
    textAlign: 'center',
  },
  claimCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  claimCardVerified: {
    borderColor: '#4ECDC4',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
  },
  claimCardRejected: {
    borderColor: '#FF4444',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  claimInfo: {
    flex: 1,
  },
  claimPrize: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  claimPlayer: {
    fontSize: 16,
    color: '#FFF',
    marginTop: 4,
  },
  claimTicket: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  claimAmount: {
    alignItems: 'flex-end',
  },
  claimAmountText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  autoVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  autoVerifiedText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  claimFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  claimTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  claimActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#FF4444',
  },
  approveButton: {
    backgroundColor: '#4ECDC4',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  rejectedBadge: {},
  rejectedText: {
    color: '#FF4444',
  },
});
