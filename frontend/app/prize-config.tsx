import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PrizeCategory {
  id: string;
  name: string;
  icon: string;
}

const PRIZE_CATEGORIES: PrizeCategory[] = [
  { id: 'corners', name: 'Corners', icon: 'crop-square' },
  { id: 'early', name: 'Early / Jaldi / Quickly / Lucky', icon: 'clock-fast' },
  { id: 'extra', name: 'Extra', icon: 'plus-circle' },
  { id: 'letters', name: 'Letters / Words', icon: 'alphabetical' },
  { id: 'math', name: 'Math', icon: 'calculator' },
  { id: 'minmax', name: 'Min - Max / Temperature / BP', icon: 'thermometer' },
  { id: 'starend', name: 'All Number Start & End With', icon: 'numeric' },
  { id: 'pairs', name: 'Pairs', icon: 'cards' },
  { id: 'rowline', name: 'Row / Line', icon: 'view-sequential' },
  { id: 'special', name: 'Special Numbers', icon: 'star' },
  { id: 'house', name: 'House', icon: 'home' },
];

export default function PrizeConfigScreen() {
  const router = useRouter();
  const [customPrizes, setCustomPrizes] = useState<any[]>([]);

  React.useEffect(() => {
    loadCustomPrizes();
  }, []);

  // Reload when screen is focused
  React.useEffect(() => {
    const interval = setInterval(loadCustomPrizes, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadCustomPrizes = async () => {
    try {
      const prizesData = await AsyncStorage.getItem('selected_prizes');
      if (prizesData) {
        const allPrizes = JSON.parse(prizesData);
        const customs = allPrizes.filter((p: any) => p.id.startsWith('custom_'));
        setCustomPrizes(customs);
      }
    } catch (error) {
      console.error('Error loading custom prizes:', error);
    }
  };

  const deleteCustomPrize = async (prizeId: string) => {
    try {
      const prizesData = await AsyncStorage.getItem('selected_prizes');
      if (prizesData) {
        const allPrizes = JSON.parse(prizesData);
        const filtered = allPrizes.filter((p: any) => p.id !== prizeId);
        await AsyncStorage.setItem('selected_prizes', JSON.stringify(filtered));
        loadCustomPrizes();
      }
    } catch (error) {
      console.error('Error deleting custom prize:', error);
    }
  };

  const handleDeleteCustomPrize = (prize: any) => {
    Alert.alert(
      'Delete Custom Prize',
      `Are you sure you want to delete "${prize.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCustomPrize(prize.id)
        }
      ]
    );
  };

  const handleCategoryPress = (category: PrizeCategory) => {
    router.push({
      pathname: '/prize-category-detail',
      params: {
        categoryId: category.id,
        categoryName: category.name,
      },
    });
  };

  const renderCategory = ({ item }: { item: PrizeCategory }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.categoryName}>{item.name}</Text>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#4A4A4A" />
    </TouchableOpacity>
  );

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

        <View style={styles.designYourOwnContainer}>
          <TouchableOpacity
            style={styles.designYourOwnButton}
            onPress={() => router.push('/custom-claim-designer')}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#4A4A4A" />
            <Text style={styles.designYourOwnText}>Design your own claim</Text>
          </TouchableOpacity>
        </View>

        {customPrizes.length > 0 && (
          <View style={styles.customPrizesSection}>
            <Text style={styles.customPrizesTitle}>Your Custom Prizes</Text>
            {customPrizes.map((prize) => (
              <View key={prize.id} style={styles.customPrizeCard}>
                <View style={styles.customPrizeInfo}>
                  <Text style={styles.customPrizeName}>{prize.name}</Text>
                  <Text style={styles.customPrizeAmount}>₹{prize.amount}</Text>
                  {prize.description && (
                    <Text style={styles.customPrizeDesc}>{prize.description}</Text>
                  )}
                  <Text style={styles.customPrizePattern}>
                    {prize.pattern?.length || 0} cells selected
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteCustomPrize(prize)}
                >
                  <MaterialCommunityIcons name="delete" size={20} color="#FF6B35" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <FlatList
          data={PRIZE_CATEGORIES}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push('/share-prize')}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
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
  designYourOwnContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  designYourOwnButton: {
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#4A4A4A',
  },
  designYourOwnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A4A4A',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  categoryCard: {
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#4A4A4A',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A4A4A',
    flex: 1,
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
  customPrizesSection: {
    padding: 16,
    paddingTop: 0,
  },
  customPrizesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 12,
  },
  customPrizeCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  customPrizeInfo: {
    flex: 1,
  },
  customPrizeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  customPrizeAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  customPrizeDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  customPrizePattern: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
});
