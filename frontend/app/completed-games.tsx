import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { roomAPI } from '../services/api';

interface Room {
  id: string;
  name: string;
  host_name: string;
  status: string;
  ticket_price: number;
  prize_pool: number;
  current_players: number;
  max_players: number;
  completed_at?: string;
}

export default function CompletedGamesScreen() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRooms = async () => {
    try {
      const data = await roomAPI.getCompletedRooms();
      setRooms(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Completed games load error:', e);
      setRooms([]);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const renderRoom = ({ item }: { item: Room }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/room/[id]', params: { id: item.id } })}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.roomName}>{item.name}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>COMPLETED</Text>
        </View>
      </View>
      <Text style={styles.host}>Host: {item.host_name}</Text>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="account-group" size={18} color="#FFD700" />
          <Text style={styles.statText}>{item.current_players}/{item.max_players}</Text>
        </View>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="trophy" size={18} color="#FFD700" />
          <Text style={styles.statText}>₹{item.prize_pool ?? 0}</Text>
        </View>
      </View>
      {item.completed_at && (
        <Text style={styles.date}>Ended: {new Date(item.completed_at).toLocaleString()}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#1a5f1a', '#2d8b2d']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFD700" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Completed games</Text>
          <View style={{ width: 24 }} />
        </View>
        <FlatList
          data={rooms}
          renderItem={renderRoom}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadRooms(); }} tintColor="#FFD700" />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <MaterialCommunityIcons name="flag-checkered" size={64} color="rgba(255,215,0,0.4)" />
                <Text style={styles.emptyText}>No completed games yet</Text>
              </View>
            ) : null
          }
        />
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
  list: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.5)',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  roomName: { fontSize: 18, fontWeight: 'bold', color: '#FFD700', flex: 1 },
  statusBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#FFF' },
  host: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  stats: { flexDirection: 'row', gap: 16, marginBottom: 4 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 14, color: '#FFF', fontWeight: '600' },
  date: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 16 },
});
