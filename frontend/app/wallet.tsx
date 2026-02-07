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
import { walletAPI } from '../services/api';

export default function WalletScreen() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [balance, setBalance] = useState<number>(user?.wallet_balance ?? 0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setBalance(user?.wallet_balance ?? 0);
  }, [user?.wallet_balance]);

  const loadData = async () => {
    try {
      const [balRes, txnRes] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getTransactions().catch(() => []),
      ]);
      if (balRes && typeof (balRes as any).balance === 'number') {
        setBalance((balRes as any).balance);
      }
      if (Array.isArray(txnRes)) setTransactions(txnRes);
      else if (txnRes && Array.isArray((txnRes as any).data)) setTransactions((txnRes as any).data);
    } catch (_) {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    refreshProfile();
    loadData();
  };

  if (!user) {
    return (
      <LinearGradient colors={['#1a5f1a', '#2d8b2d']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#FFD700" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Wallet</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.centered}>
            <Text style={styles.placeholder}>Please log in</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1a5f1a', '#2d8b2d']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFD700" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wallet</Text>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <MaterialCommunityIcons name="account-circle" size={28} color="#FFD700" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />
          }
        >
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Current balance</Text>
            <Text style={styles.balanceValue}>₹{(balance ?? 0).toFixed(2)}</Text>
            <Text style={styles.updatedText}>Updates in real-time</Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              Alert.alert(
                'Add money',
                'Use Profile or payment flow to add money to your wallet.',
                [{ text: 'OK' }]
              );
            }}
          >
            <MaterialCommunityIcons name="plus-circle" size={24} color="#1a5f1a" />
            <Text style={styles.addButtonText}>Add money</Text>
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent transactions</Text>
            {loading && transactions.length === 0 ? (
              <Text style={styles.muted}>Loading...</Text>
            ) : transactions.length === 0 ? (
              <Text style={styles.muted}>No transactions yet</Text>
            ) : (
              transactions.slice(0, 20).map((tx: any) => (
                <View key={tx.id || tx.created_at} style={styles.txnRow}>
                  <MaterialCommunityIcons
                    name={tx.type === 'credit' ? 'arrow-down-circle' : 'arrow-up-circle'}
                    size={24}
                    color={tx.type === 'credit' ? '#4ECDC4' : '#FF6B35'}
                  />
                  <View style={styles.txnInfo}>
                    <Text style={styles.txnDesc}>{tx.description || 'Transaction'}</Text>
                    <Text style={styles.txnDate}>
                      {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : ''}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.txnAmount,
                      tx.type === 'credit' ? styles.credit : styles.debit,
                    ]}
                  >
                    {tx.type === 'credit' ? '+' : '-'}₹{Number(tx.amount || 0).toFixed(2)}
                  </Text>
                </View>
              ))
            )}
          </View>
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
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
    marginBottom: 20,
  },
  balanceLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  balanceValue: { fontSize: 36, fontWeight: 'bold', color: '#FFD700' },
  updatedText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 8 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  addButtonText: { fontSize: 16, fontWeight: 'bold', color: '#1a5f1a' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFD700', marginBottom: 12 },
  muted: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    gap: 12,
  },
  txnInfo: { flex: 1 },
  txnDesc: { fontSize: 14, color: '#FFF' },
  txnDate: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  txnAmount: { fontSize: 16, fontWeight: 'bold' },
  credit: { color: '#4ECDC4' },
  debit: { color: '#FF6B35' },
});
