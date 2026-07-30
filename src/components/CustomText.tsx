import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';

export const CustomText: React.FC<TextProps> = ({ style, ...props }) => {
  return <RNText style={[styles.defaultText, style]} {...props} />;
};

const styles = StyleSheet.create({
  defaultText: {
    fontFamily: 'System',
  },
});
