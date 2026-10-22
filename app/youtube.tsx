import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { YouTubeScreen } from '../src/screens/YouTubeScreen';

export default function YouTubeRoute() {
  const params = useLocalSearchParams<{ url?: string }>();
  const initialUrl = typeof params.url === 'string' && params.url.trim() ? params.url : 'https://www.youtube.com';

  return <YouTubeScreen initialUrl={initialUrl} />;
}
