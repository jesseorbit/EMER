import { PropsWithChildren } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from '@granite-js/native/react-native-safe-area-context';
import { COLORS } from '../constants';

export default function Layout({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
