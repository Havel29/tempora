import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Card, Text, IconButton, Divider, FAB } from 'react-native-paper';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import dayjs from 'dayjs';
import { getEventsByDate, deleteEvent, Event } from '@/lib/db';
import { getGlobalEventsFor, GlobalEvent } from '@/data/globalEvents';

export default function DayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date: string }>();
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const date = params.date || dayjs().format('YYYY-MM-DD');
  const globalEvents = useMemo(() => getGlobalEventsFor(date), [date]);

  useEffect(() => {
    loadEvents();
  }, [date]);

  async function loadEvents() {
    const rows = await getEventsByDate(date);
    setUserEvents(rows);
  }

  async function handleDelete(id: number) {
    await deleteEvent(id);
    await loadEvents();
  }

  function handleAdd() {
    router.push(`/add?date=${date}` as any);
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={dayjs(date).format('D MMMM YYYY')} />
      </Appbar.Header>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {globalEvents.length > 0 && (
          <>
            <Card style={styles.card}>
              <Card.Title title="Accadde oggi" subtitle="Eventi storici" />
              <Card.Content>
                {globalEvents
                  .sort((a, b) => b.year - a.year)
                  .map((e: GlobalEvent, idx: number) => (
                  <View key={idx} style={styles.eventItem}>
                    <Text variant="titleMedium" style={styles.eventYear}>{e.year}</Text>
                    <Text variant="bodyLarge" style={styles.eventTitle}>{e.title}</Text>
                    <Text variant="bodyMedium" style={styles.eventDesc}>{e.description}</Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
            <Divider style={styles.divider} />
          </>
        )}

        <Card style={styles.card}>
          <Card.Title title="I tuoi momenti" subtitle={`${userEvents.length} salvati`} />
          <Card.Content>
            {userEvents.length === 0 ? (
              <Text variant="bodyMedium" style={styles.emptyText}>
                Nessun momento salvato per questo giorno
              </Text>
            ) : (
              userEvents.map((e: Event) => (
                <Card key={e.id} style={styles.momentCard}>
                  <Card.Content>
                    <View style={styles.momentHeader}>
                      <Text variant="titleMedium" style={styles.momentTitle}>{e.title}</Text>
                      <IconButton
                        icon="delete"
                        size={20}
                        onPress={() => handleDelete(e.id!)}
                      />
                    </View>
                    {e.description && (
                      <Text variant="bodyMedium" style={styles.momentDesc}>{e.description}</Text>
                    )}
                  </Card.Content>
                </Card>
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAdd}
        label="Aggiungi"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
  },
  eventItem: {
    marginVertical: 12,
  },
  eventYear: {
    color: '#6366F1',
    fontWeight: 'bold',
  },
  eventTitle: {
    fontWeight: '600',
    marginTop: 2,
  },
  eventDesc: {
    opacity: 0.8,
    marginTop: 2,
  },
  divider: {
    marginVertical: 24,
  },
  emptyText: {
    opacity: 0.7,
    textAlign: 'center',
    marginVertical: 16,
  },
  momentCard: {
    marginBottom: 12,
  },
  momentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  momentTitle: {
    flex: 1,
    fontWeight: '600',
  },
  momentDesc: {
    marginTop: 8,
    opacity: 0.8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
