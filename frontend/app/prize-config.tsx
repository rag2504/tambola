import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

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
          <TouchableOpacity style={styles.designYourOwnButton}>
            <MaterialCommunityIcons name="plus" size={20} color="#4A4A4A" />
            <Text style={styles.designYourOwnText}>Design your own claim</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={PRIZE_CATEGORIES}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push('/game')}
          >
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
});
