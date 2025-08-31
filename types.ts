// FIX: Add missing import for React to resolve type error.
import React from 'react';

export enum GameState {
  START,
  LOADING,
  PLAYING,
  VERIFYING,
  SUCCESS,
  FINAL_FAIL,
  FINAL_SUCCESS
}

export interface ChallengeProps {
  onComplete: (success: boolean) => void;
  data: ChallengeData;
  key: number;
}

export interface ChallengeData {
  level: number;
  title: string;
  instruction?: string;
  component: React.FC<ChallengeProps>;
  payload?: any;
}