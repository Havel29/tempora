import { useColorScheme } from '@/hooks/use-color-scheme';
import {
    cancelAllNotifications,
    requestNotificationPermissions,
    scheduleDailyHistoryNotification,
    sendTestNotification as sendTest
} from '@/lib/notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { Alert, Appearance, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, List, Switch, Text } from 'react-native-paper';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkNotificationPermissions();
    loadSettings();
  }, []);

  const checkNotificationPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    setHasPermission(existingStatus === 'granted');
  };

  const loadSettings = async () => {
    try {
      // Load saved settings from AsyncStorage if needed
      // For now, default to 9:00 AM
      const defaultTime = new Date();
      defaultTime.setHours(9, 0, 0, 0);
      setNotificationTime(defaultTime);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const requestPermissions = async () => {
    const granted = await requestNotificationPermissions();
    
    if (!granted) {
      Alert.alert(
        'Permesso negato',
        'Per ricevere notifiche giornaliere, devi abilitare i permessi nelle impostazioni del dispositivo.',
        [{ text: 'OK' }]
      );
      return false;
    }

    setHasPermission(true);
    return true;
  };

  const scheduleNotification = async () => {
    if (!notificationsEnabled) {
      return;
    }

    const success = await scheduleDailyHistoryNotification(
      notificationTime.getHours(),
      notificationTime.getMinutes()
    );

    if (!success) {
      Alert.alert('Errore', 'Impossibile programmare la notifica.');
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (value && !hasPermission) {
      const granted = await requestPermissions();
      if (!granted) {
        return;
      }
    }

    setNotificationsEnabled(value);
    
    if (value) {
      await scheduleNotification();
      Alert.alert(
        'Notifiche attivate',
        `Riceverai una notifica ogni giorno alle ${dayjs(notificationTime).format('HH:mm')}`,
        [{ text: 'OK' }]
      );
    } else {
      await cancelAllNotifications();
      Alert.alert('Notifiche disattivate', 'Non riceverai più notifiche giornaliere.', [{ text: 'OK' }]);
    }
  };

  const handleTimeChange = async (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    
    if (selectedTime) {
      setNotificationTime(selectedTime);
      
      if (notificationsEnabled) {
        await scheduleNotification();
        Alert.alert(
          'Orario aggiornato',
          `La notifica giornaliera sarà inviata alle ${dayjs(selectedTime).format('HH:mm')}`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleSendTestNotification = async () => {
    if (!hasPermission) {
      const granted = await requestPermissions();
      if (!granted) {
        return;
      }
    }

    const success = await sendTest();
    
    if (success) {
      Alert.alert('Notifica di prova inviata', 'Controlla la barra delle notifiche!', [{ text: 'OK' }]);
    } else {
      Alert.alert('Errore', 'Impossibile inviare la notifica di prova.');
    }
  };

  const handleToggleTheme = (value: boolean) => {
    setIsDarkMode(value);
    Appearance.setColorScheme(value ? 'dark' : 'light');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>⚙️ Impostazioni</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Personalizza la tua esperienza
          </Text>
        </View>

        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              🎨 Tema
            </Text>
            <Text variant="bodyMedium" style={styles.sectionDescription}>
              Scegli tra tema chiaro e scuro
            </Text>
          </Card.Content>

          <Divider />

          <List.Item
            title="Tema scuro"
            description={isDarkMode ? 'Attivo' : 'Disattivato'}
            left={(props) => <List.Icon {...props} icon={isDarkMode ? 'weather-night' : 'weather-sunny'} />}
            right={() => (
              <Switch
                value={isDarkMode}
                onValueChange={handleToggleTheme}
              />
            )}
          />
        </Card>

        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              🔔 Notifiche
            </Text>
            <Text variant="bodyMedium" style={styles.sectionDescription}>
              Ricevi una notifica giornaliera sugli eventi storici accaduti oggi
            </Text>
          </Card.Content>

          <Divider />

          <List.Item
            title="Notifiche giornaliere"
            description={notificationsEnabled ? 'Attive' : 'Disattivate'}
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
              />
            )}
          />

          <Divider />

          <List.Item
            title="Orario notifica"
            description={dayjs(notificationTime).format('HH:mm')}
            left={(props) => <List.Icon {...props} icon="clock-outline" />}
            onPress={() => setShowTimePicker(true)}
            disabled={!notificationsEnabled}
          />

          {showTimePicker && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={notificationTime}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
              />
            </View>
          )}

          <Card.Actions>
            <Button
              mode="outlined"
              onPress={handleSendTestNotification}
              icon="bell-ring"
              style={styles.testButton}
            >
              Invia notifica di prova
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              ℹ️ Informazioni
            </Text>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>Versione:</Text>
              <Text variant="bodyMedium" style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>App:</Text>
              <Text variant="bodyMedium" style={styles.infoValue}>Tempora</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>Descrizione:</Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                Scopri eventi storici e salva i tuoi momenti speciali
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionDescription: {
    opacity: 0.7,
    marginBottom: 8,
  },
  pickerContainer: {
    padding: 16,
    alignItems: 'center',
  },
  testButton: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  infoLabel: {
    opacity: 0.7,
    fontWeight: '600',
  },
  infoValue: {
    flex: 1,
    textAlign: 'right',
  },
});
