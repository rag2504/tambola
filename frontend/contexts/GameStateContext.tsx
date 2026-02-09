import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrizeClaim } from '../types/claim-types';

interface GameState {
  currentNumber: number | null;
  calledNumbers: number[];
  isAutoCalling: boolean;
  gameId: string | null;
  claims: PrizeClaim[];
}

interface GameStateContextType {
  gameState: GameState;
  callNumber: () => Promise<void>;
  setAutoCalling: (isAuto: boolean) => void;
  resetGame: () => void;
  initializeGame: (gameId: string) => void;
  addClaim: (claim: PrizeClaim) => Promise<void>;
  updateClaimStatus: (claimId: string, verified: boolean) => Promise<void>;
  isPrizeClaimed: (prizeId: string) => boolean;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export const GameStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>({
    currentNumber: null,
    calledNumbers: [],
    isAutoCalling: false,
    gameId: null,
    claims: [],
  });

  // Load game state from storage on mount
  useEffect(() => {
    loadGameState();
  }, []);

  const loadGameState = async () => {
    try {
      const savedState = await AsyncStorage.getItem('game_state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setGameState(parsed);
      }
    } catch (error) {
      console.error('Error loading game state:', error);
    }
  };

  const saveGameState = async (newState: GameState) => {
    try {
      await AsyncStorage.setItem('game_state', JSON.stringify(newState));
      setGameState(newState);
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  };

  const callNumber = useCallback(async () => {
    const currentCalled = gameState.calledNumbers;
    const availableNumbers = Array.from({ length: 90 }, (_, i) => i + 1).filter(
      (n) => !currentCalled.includes(n)
    );

    if (availableNumbers.length === 0) {
      return;
    }

    // Get preferred ticket for weighted selection
    const preferredTicketId = await AsyncStorage.getItem('admin_selected_ticket');
    let nextNumber: number;

    if (preferredTicketId) {
      const ticketsData = await AsyncStorage.getItem('generated_tickets');
      if (ticketsData) {
        const tickets = JSON.parse(ticketsData);
        const preferredTicket = tickets.find((t: any) => t.id === preferredTicketId);

        if (preferredTicket) {
          const preferredNumbers: number[] = preferredTicket.numbers.filter(
            (n: number) => !currentCalled.includes(n)
          );
          const otherNumbers: number[] = availableNumbers.filter(
            (n: number) => !preferredNumbers.includes(n)
          );

          if (preferredNumbers.length > 0) {
            // Strong bias: ~80% chance to call from preferred ticket,
            // 20% from others to keep it looking natural.
            const usePreferred = Math.random() < 0.8 || otherNumbers.length === 0;
            if (usePreferred) {
              nextNumber = preferredNumbers[Math.floor(Math.random() * preferredNumbers.length)];
            } else {
              nextNumber = otherNumbers[Math.floor(Math.random() * otherNumbers.length)];
            }
          } else {
            // All preferred numbers already called, fall back to normal random
            nextNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
          }
        } else {
          nextNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
        }
      } else {
        nextNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
      }
    } else {
      // Normal random selection
      nextNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
    }

    const newCalledNumbers = [...currentCalled, nextNumber];
    const newState: GameState = {
      ...gameState,
      currentNumber: nextNumber,
      calledNumbers: newCalledNumbers,
    };

    await saveGameState(newState);
  }, [gameState]);

  const setAutoCalling = useCallback(async (isAuto: boolean) => {
    const newState: GameState = {
      ...gameState,
      isAutoCalling: isAuto,
    };
    await saveGameState(newState);
  }, [gameState]);

  const resetGame = useCallback(async () => {
    const newState: GameState = {
      currentNumber: null,
      calledNumbers: [],
      isAutoCalling: false,
      gameId: null,
      claims: [],
    };
    await saveGameState(newState);
  }, []);

  const initializeGame = useCallback(async (gameId: string) => {
    const newState: GameState = {
      ...gameState,
      gameId,
    };
    await saveGameState(newState);
  }, [gameState]);

  const addClaim = useCallback(async (claim: PrizeClaim) => {
    const newClaims = [...gameState.claims, claim];
    const newState: GameState = {
      ...gameState,
      claims: newClaims,
    };
    await saveGameState(newState);

    // Also save to separate claims storage for history
    await AsyncStorage.setItem('game_claims', JSON.stringify(newClaims));
  }, [gameState]);

  const updateClaimStatus = useCallback(async (claimId: string, verified: boolean) => {
    const updatedClaims = gameState.claims.map(claim =>
      claim.id === claimId ? { ...claim, verified } : claim
    );
    const newState: GameState = {
      ...gameState,
      claims: updatedClaims,
    };
    await saveGameState(newState);

    // Also update separate claims storage
    await AsyncStorage.setItem('game_claims', JSON.stringify(updatedClaims));
  }, [gameState]);

  const isPrizeClaimed = useCallback((prizeId: string): boolean => {
    return gameState.claims.some(claim => claim.prize_id === prizeId && claim.verified);
  }, [gameState.claims]);

  return (
    <GameStateContext.Provider
      value={{
        gameState,
        callNumber,
        setAutoCalling,
        resetGame,
        initializeGame,
        addClaim,
        updateClaimStatus,
        isPrizeClaimed,
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within GameStateProvider');
  }
  return context;
};
