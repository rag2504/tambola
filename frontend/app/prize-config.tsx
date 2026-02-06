import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Switch,
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
  enabled: boolean;
  description: string;
}

const DEFAULT_PRIZES: Prize[] = [
  { id: '4corners', name: '4 Corners', amount: '500', enabled: true, description: 'All 4 corner numbers' },
  { id: 'early5', name: 'Early 5', amount: '500', enabled: true, description: 'First 5 numbers' },
  { id: 'topline', name: 'Top Line', amount: '1000', enabled: true, description: 'Complete top row' },
  { id: 'middleline', name: 'Middle Line', amount: '1000', enabled: true, description: 'Complete middle row' },
  { id: 'bottomline', name: 'Bottom Line', amount: '1000', enabled: true, description: 'Complete bottom row' },
  { id: 'fullhouse', name: 'Full House', amount: '5000', enabled: true, description: 'All numbers on ticket' },
];

export default function PrizeConfigScreen() {
  const router = useRouter();
  const [prizes, setPrizes] = useState<Prize[]>(DEFAULT_PRIZES);

  useEffect(() => {
    loadPrizes();
  }, []);

  const loadPrizes = async () => {
    try {
      const saved = await AsyncStorage.getItem('prize_config');
      if (saved) {
        setPrizes(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading prizes:', error);
    }
  };

  const savePrizes = async (updatedPrizes: Prize[]) => {
    try {
      await AsyncStorage.setItem('prize_config', JSON.stringify(updatedPrizes));
      setPrizes(updatedPrizes);
    } catch (error) {
      console.error('Error saving prizes:', error);
    }
  };

  const updatePrize = (id: string, field: keyof Prize, value: any) => {
    const updated = prizes.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    );
    savePrizes(updated);
  };

  const getTotalPrizePool = () => {
    return prizes
      .filter(p => p.enabled)
      .reduce((sum, p) => sum + (parseInt(p.amount) || 0), 0);
  };

  const handleContinue = async () => {
    const enabledPrizes = prizes.filter(p => p.enabled);
    if (enabledPrizes.length === 0) {
      Alert.alert('Error', 'Please enable at least one prize');
      return;
    }

    await savePrizes(prizes);
    router.push('/game');
  };

  return (
    <LinearGradient colors={['#1a5f1a', '#2d8b2d']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFD700" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Prize Configuration</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="trophy" size={24} color="#FFD700" />
            <Text style={styles.infoText}>
              Configure prizes for your game. Enable/disable prizes and set amounts.
            </Text>
          </View>

          {prizes.map((prize) => (
            <View key={prize.id} style={styles.prizeCard}>
              <View style={styles.prizeHeader}>
                <View style={styles.prizeInfo}>
                  <Text style={styles.prizeName}>{prize.name}</Text>
                  <Text style={styles.prizeDescription}>{prize.description}</Text>
                </View>
                <Switch
                  value={prize.enabled}
                  onValueChange={(value) => updatePrize(prize.id, 'enabled', value)}
                  trackColor={{ false: '#767577', true: '#FFD700' }}
                  thumbColor={prize.enabled ? '#1a5f1a' : '#f4f3f4'}
                />
              </View>
              {prize.enabled && (
                <View style={styles.amountContainer}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={prize.amount}
                    onChangeText={(value) => updatePrize(prize.id, 'amount', value)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#999"
                  />
                </View>
              )}
            </View>
          ))}

          <View style={styles.totalCard}>
            <MaterialCommunityIcons name="cash-multiple" size={32} color="#FFD700" />
            <View style={styles.totalInfo}>
              <Text style={styles.totalLabel}>Total Prize Pool</Text>
              <Text style={styles.totalAmount}>₹ {getTotalPrizePool().toLocaleString()}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue to Game</Text>
            <MaterialCommunityIcons name="arrow-right" size={24} color="#FFF" />
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#FFF',
    lineHeight: 20,
  },
  prizeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  prizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prizeInfo: {
    flex: 1,
  },
  prizeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  prizeDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a5f1a',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a5f1a',
    paddingVertical: 12,
  },
  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    borderWidth: 3,
    borderColor: '#FFD700',
    gap: 16,
  },
  totalInfo: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
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
