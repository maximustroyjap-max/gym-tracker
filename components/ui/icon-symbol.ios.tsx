import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';

/**
 * Names that are NOT valid SF Symbols — must render via MaterialIcons on iOS.
 * All other names are passed through to the native SymbolView.
 */
const MATERIAL_ONLY: Record<string, string> = {
  search: 'search',
  'more-vert': 'more-vert',
  settings: 'settings',
  'arrow.up.arrow.down': 'swap-vert',
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: string;
  size?: number;
  color: string;
  style?: StyleProp<TextStyle | ViewStyle>;
  weight?: SymbolWeight;
}) {
  const materialName = MATERIAL_ONLY[name];

  if (materialName) {
    return (
      <MaterialIcons
        name={materialName as any}
        size={size}
        color={color}
        style={style as StyleProp<TextStyle>}
      />
    );
  }

  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={name as SymbolViewProps['name']}
      style={[
        {
          width: size,
          height: size,
        },
        style as StyleProp<ViewStyle>,
      ]}
    />
  );
}
