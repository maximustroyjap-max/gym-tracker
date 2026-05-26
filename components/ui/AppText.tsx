import React from 'react';
import { Text, TextProps } from 'react-native';
import { fontFamily } from '@/constants/design';

interface AppTextProps extends TextProps {
  weight?: keyof typeof fontFamily;
}

export function AppText({ weight = 'regular', style, ...props }: AppTextProps) {
  return (
    <Text
      style={[{ fontFamily: fontFamily[weight] }, style]}
      {...props}
    />
  );
}
