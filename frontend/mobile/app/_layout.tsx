import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ToastProvider } from '@/components/ui';
import { OfflineQueueProvider } from '@/providers/OfflineQueueProvider';
import { NetworkStatus } from '@/components/ui/NetworkStatus';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <OfflineQueueProvider>
        <ToastProvider>
          <NetworkStatus />
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
              },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </ToastProvider>
      </OfflineQueueProvider>
    </GestureHandlerRootView>
  );
}
