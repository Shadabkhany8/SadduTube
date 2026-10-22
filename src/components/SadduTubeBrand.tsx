import React from 'react';
import { View, Text, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface SadduTubeBrandProps {
  size?: 'small' | 'medium' | 'large';
  showTagline?: boolean;
  tagline?: string;
  style?: StyleProp<ViewStyle>;
  layout?: 'horizontal' | 'vertical';
}

export const SadduTubeBrand: React.FC<SadduTubeBrandProps> = ({
  size = 'medium',
  showTagline = false,
  tagline = 'Dedicated YouTube Experience',
  style,
  layout = 'horizontal',
}) => {
  const { theme } = useTheme();

  const iconDimensions = {
    small: { width: 28, height: 28, borderRadius: 7 },
    medium: { width: 36, height: 36, borderRadius: 9 },
    large: { width: 64, height: 64, borderRadius: 16 },
  }[size];

  const fontSizes = {
    small: { title: 16, subtitle: 10 },
    medium: { title: 19, subtitle: 11 },
    large: { title: 28, subtitle: 13 },
  }[size];

  const isVertical = layout === 'vertical';

  return (
    <View style={[styles.container, isVertical && styles.verticalContainer, style]}>
      <Image
        source={require('../../assets/images/AppIcon.png')}
        style={[
          styles.icon,
          {
            width: iconDimensions.width,
            height: iconDimensions.height,
            borderRadius: iconDimensions.borderRadius,
          },
        ]}
        resizeMode="cover"
      />
      <View style={[styles.textWrapper, isVertical && styles.verticalTextWrapper]}>
        <Text style={[styles.title, { fontSize: fontSizes.title, color: theme.colors.textPrimary }]}>
          Saddu<Text style={{ color: theme.colors.primary }}>Tube</Text>
        </Text>
        {showTagline && (
          <Text style={[styles.tagline, { fontSize: fontSizes.subtitle, color: theme.colors.textMuted }]}>
            {tagline}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  verticalContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    shadowColor: '#FF1E38',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  textWrapper: {
    justifyContent: 'center',
  },
  verticalTextWrapper: {
    alignItems: 'center',
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  tagline: {
    fontWeight: '500',
    marginTop: 1,
  },
});
