import { deleteEvent, Event, getAllEventDates, getEventsByDate, initDb } from '@/lib/db';
import dayjs from 'dayjs';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Card, IconButton, Surface, Text, useTheme } from 'react-native-paper';

export default function MomentsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [moments, setMoments] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAndLoad();
  }, []);

  const initializeAndLoad = async () => {
    try {
      await initDb();
      await loadAllMoments();
    } catch (error) {
      console.error('Error initializing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllMoments = async () => {
    try {
      const dates = await getAllEventDates();
      const allMoments: Event[] = [];
      
      for (const dateObj of dates) {
        const events = await getEventsByDate(dateObj.date);
        allMoments.push(...events);
      }
      
      // Sort by date descending (most recent first)
      allMoments.sort((a, b) => {
        return dayjs(b.date).valueOf() - dayjs(a.date).valueOf();
      });
      
      setMoments(allMoments);
    } catch (error) {
      console.error('Error loading moments:', error);
    }
  };

  const handleDelete = (id: number, title: string) => {
    Alert.alert(
      'Elimina Momento',
      `Vuoi davvero eliminare "${title}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEvent(id);
              await loadAllMoments();
            } catch (error) {
              console.error('Error deleting moment:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="💫 I Tuoi Eventi" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {moments.length === 0 ? (
          <Surface style={styles.emptyCard} elevation={0}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              Nessun evento salvato
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Aggiungi i tuoi eventi speciali per rivederli qui
            </Text>
          </Surface>
        ) : (
          moments.map((moment, index) => (
            <Card key={moment.id} style={styles.card} mode="elevated">
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={[styles.dateContainer, { backgroundColor: theme.colors.primaryContainer }]}>
                    <Text variant="labelSmall" style={[styles.dateLabel, { color: theme.colors.primary }]}>
                      {dayjs(moment.date).format('DD MMMM YYYY')}
                    </Text>
                  </View>
                  <IconButton
                    icon="delete-outline"
                    size={20}
                    onPress={() => moment.id && handleDelete(moment.id, moment.title)}
                  />
                </View>
                <Text variant="titleMedium" style={styles.title}>
                  {moment.title}
                </Text>
                {moment.description ? (
                  <Text variant="bodyMedium" style={styles.description}>
                    {moment.description}
                  </Text>
                ) : null}
              </Card.Content>
            </Card>
          ))
        )}
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
    paddingBottom: 40,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    opacity: 0.5,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateLabel: {
    fontWeight: 'bold',
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    opacity: 0.8,
    lineHeight: 20,
  },
});
