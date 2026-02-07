import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { winningsAPI } from '../services/api';

interface WinningsEntry {
  user_id: string;
  room_id: string;
  room_name?: string;
  total_won: number;
  prizes_won: Array<{ prize_type: string; amount: number }>;
  completed_at: string;
}

export default function WinningsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [list, setList] = useState<WinningsEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWinnings = async () => {
    try {
      const res = await winningsAPI.getMyWinnings();
      if (Array.isArray(res)) setList(res);
      else if (res && Array.isArray((res as any).data)) setList((res as any).data);
    } catch (e) {
      console.error('Winnings load error:', e);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadWinnings();
  }, []);

  if (!user) {
    return (
      <LinearGradient colors={['#1a5f1a', '#2d8b2d']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#FFD700" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Winnings</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.centered}>
            <Text style={styles.placeholder}>Please log in</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const totalWon = list.reduce((s, e) => s + (e.total_won || 0), 0);

  return (
    <LinearGradient colors={['#1a5f1a', '#2d8b2d']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFD700" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Winnings</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadWinnings(); }} tintColor="#FFD700" />
          }
        >
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total winnings</Text>
            <Text style={styles.summaryValue}>₹{totalWon.toFixed(2)}</Text>
            <Text style={styles.summarySub}>Across {list.length} game(s)</Text>
          </View>

          <Text style={styles.sectionTitle}>Game history</Text>
          {loading && list.length === 0 ? (
            <Text style={styles.muted}>Loading...</Text>
          ) : list.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="trophy-outline" size={48} color="rgba(255,215,0,0.5)" />
              <Text style={styles.emptyText}>No winnings yet</Text>
              <Text style={styles.emptySub}>Win prizes in games to see them here</Text>
            </View>
          ) : (
            list.map((entry, idx) => (
              <View key={`${entry.room_id}-${entry.completed_at}-${idx}`} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <Text style={styles.roomName}>{entry.room_name || entry.room_id}</Text>
                  <Text style={styles.entryAmount}>₹{(entry.total_won || 0).toFixed(2)}</Text>
                </View>
                {(entry.prizes_won || []).map((p, i) => (
                  <View key={i} style={styles.prizeRow}>
                    <Text style={styles.prizeType}>{p.prize_type?.replace('_', ' ')}</Text>
                    <Text style={styles.prizeAmount}>₹{(p.amount || 0).toFixed(2)}</Text>
                  </View>
                ))}
                <Text style={styles.entryDate}>
                  {entry.completed_at ? new Date(entry.completed_at).toLocaleString() : ''}
                </Text>
              </View>
            ))
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
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFD700' },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholder: { fontSize: 16, color: '#FFF' },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
    marginBottom: 24,
  },
  summaryLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  summaryValue: { fontSize: 32, fontWeight: 'bold', color: '#FFD700' },
  summarySub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFD700', marginBottom: 12 },
  muted: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  emptyText: { fontSize: 18, color: '#FFF', marginTop: 12 },
  emptySub: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  entryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  roomName: { fontSize: 16, fontWeight: '600', color: '#FFD700' },
  entryAmount: { fontSize: 18, fontWeight: 'bold', color: '#4ECDC4' },
  prizeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  prizeType: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  prizeAmount: { fontSize: 14, color: '#FFF' },
  entryDate: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 8 },
});
