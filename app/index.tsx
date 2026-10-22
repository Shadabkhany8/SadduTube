import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import { useAppData } from '../src/context/AppDataContext';
import { BrowserItemCard } from '../src/components/BrowserItemCard';
import { normalizeYouTubeUrl } from '../src/utils/validation';
import { SadduTubeBrand } from '../src/components/SadduTubeBrand';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { history, bookmarks } = useAppData();
  const [searchQuery, setSearchQuery] = useState('');

  // Strictly filter to actual videos only (excludes homepage and search result entries)
  const validHistory = history.filter(
    (item) => Boolean(item.videoId && item.videoId.length === 11 && item.title !== 'YouTube')
  );

  const handleOpenYouTube = (targetUrl = 'https://www.youtube.com') => {
    router.push({
      pathname: '/youtube',
      params: { url: targetUrl },
    } as any);
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    const url = normalizeYouTubeUrl(searchQuery.trim());
    setSearchQuery('');
    handleOpenYouTube(url);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* App Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <SadduTubeBrand size="medium" />

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={[styles.settingsBtn, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={() => router.push('/downloads' as any)}
            activeOpacity={0.7}
            accessibilityLabel="Offline Downloads"
          >
            <Ionicons name="cloud-download-outline" size={19} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingsBtn, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={() => router.push('/settings' as any)}
            activeOpacity={0.7}
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <View style={styles.heroHeader}>
            <View style={[styles.heroIconBg, { backgroundColor: 'rgba(255, 30, 56, 0.12)' }]}>
              <Ionicons name="logo-youtube" size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.heroTextWrapper}>
              <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]}>
                Experience SadduTube
              </Text>
              <Text style={[styles.heroSubtitle, { color: theme.colors.textSecondary }]}>
                Watch, search, and discover YouTube with persistent watch history and ad-free playback.
              </Text>
            </View>
          </View>

          {/* Quick Search Bar */}
          <View style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
            <Ionicons name="search" size={18} color={theme.colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.textPrimary }]}
              placeholder="Search YouTube or enter video URL..."
              placeholderTextColor={theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={[styles.primaryLaunchBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => (searchQuery.trim() ? handleSearchSubmit() : handleOpenYouTube())}
            activeOpacity={0.85}
          >
            <Ionicons name="compass" size={20} color="#FFFFFF" />
            <Text style={styles.primaryLaunchBtnText}>
              {searchQuery.trim() ? 'Search on YouTube' : 'Open YouTube'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Nav Cards */}
        <View style={styles.navigationGrid}>
          <TouchableOpacity
            style={[styles.navCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}
            onPress={() => router.push('/bookmarks' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.navCardIconCircle, { backgroundColor: 'rgba(255, 149, 0, 0.15)' }]}>
              <Ionicons name="bookmark" size={20} color="#FF9500" />
            </View>
            <Text style={[styles.navCardTitle, { color: theme.colors.textPrimary }]}>Bookmarks</Text>
            <Text style={[styles.navCardSubtitle, { color: theme.colors.textMuted }]}>
              {bookmarks.length} {bookmarks.length === 1 ? 'saved page' : 'saved pages'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}
            onPress={() => router.push('/history' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.navCardIconCircle, { backgroundColor: 'rgba(0, 122, 255, 0.15)' }]}>
              <Ionicons name="time" size={20} color="#007AFF" />
            </View>
            <Text style={[styles.navCardTitle, { color: theme.colors.textPrimary }]}>History</Text>
            <Text style={[styles.navCardSubtitle, { color: theme.colors.textMuted }]}>
              {validHistory.length} {validHistory.length === 1 ? 'watched' : 'watched'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}
            onPress={() => router.push('/downloads' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.navCardIconCircle, { backgroundColor: 'rgba(48, 209, 88, 0.15)' }]}>
              <Ionicons name="cloud-download" size={20} color="#30D158" />
            </View>
            <Text style={[styles.navCardTitle, { color: theme.colors.textPrimary }]}>Downloads</Text>
            <Text style={[styles.navCardSubtitle, { color: theme.colors.textMuted }]}>
              Offline media
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recently Watched Carousel (Videos Only) */}
        {validHistory.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleWithIcon}>
                <Ionicons name="play-circle-outline" size={18} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Continue Watching</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/history' as any)}>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>View All ({validHistory.length})</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={validHistory.slice(0, 8)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <BrowserItemCard
                  id={item.id}
                  url={item.url}
                  title={item.title}
                  timestamp={item.watchedAt}
                  thumbnailUrl={item.thumbnailUrl}
                  layout="compact"
                />
              )}
            />
          </View>
        )}

        {/* Bookmarked Pages Preview */}
        {bookmarks.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleWithIcon}>
                <Ionicons name="bookmark-outline" size={18} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Saved Bookmarks</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/bookmarks' as any)}>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>View All ({bookmarks.length})</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={bookmarks.slice(0, 8)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <BrowserItemCard
                  id={item.id}
                  url={item.url}
                  title={item.title}
                  timestamp={item.bookmarkedAt}
                  thumbnailUrl={item.thumbnailUrl}
                  layout="compact"
                />
              )}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '500',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 20,
  },
  heroCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    gap: 14,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroIconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTextWrapper: {
    flex: 1,
    gap: 2,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  heroSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  primaryLaunchBtn: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryLaunchBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  navigationGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  navCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  navCardIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  navCardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  navCardSubtitle: {
    fontSize: 12,
  },
  sectionContainer: {
    gap: 10,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  quickExploreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickExploreChip: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  quickExploreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  horizontalList: {
    paddingVertical: 4,
  },
});
