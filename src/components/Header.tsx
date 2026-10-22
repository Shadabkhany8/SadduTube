import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { router } from 'expo-router';
import { SadduTubeBrand } from './SadduTubeBrand';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  showSearch = true,
  rightAction,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <SadduTubeBrand size="medium" />
        )}

        {title && showBack && (
          <Text numberOfLines={1} style={[styles.titleText, { color: theme.colors.textPrimary }]}>
            {title}
          </Text>
        )}
      </View>

      <View style={styles.rightContainer}>
        {rightAction}
        {showSearch && !showBack && (
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={() => router.push('/' as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="search-outline" size={18} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 12,
    flex: 1,
    letterSpacing: -0.2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

