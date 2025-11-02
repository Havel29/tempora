import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Appbar, FAB, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import { initDb } from '@/lib/db';
import { getGlobalEventsFor, GlobalEvent } from '@/data/globalEvents';

export default function HomeScreen() {
  const router = useRouter();
  const today = dayjs();
  const todayStr = today.format('YYYY-MM-DD');
  const globalEvents = useMemo(() => getGlobalEventsFor(todayStr), [todayStr]);

  useEffect(() => {
    initDb();
  }, []);

  function handleAdd() {
    router.push('/add' as any);
  }

  function handleMoments() {
    router.push('/moments' as any);
  }

  return (
    <View style={styles.container}>
            <Appbar.Header>
        <Appbar.Content title="Tempora" />
        <Appbar.Action icon="bookmark-outline" onPress={() => router.push('/moments')} />
      </Appbar.Header>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.titleMain}>Accadde oggi</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            {today.format('D MMMM YYYY')}
          </Text>
        </View>

        <View style={styles.timeline}>
          {globalEvents.length === 0 ? (
            <Surface style={styles.emptyCard} elevation={0}>
              <Text variant="bodyLarge" style={styles.emptyText}>
                Nessun evento storico registrato per questo giorno
              </Text>
            </Surface>
          ) : (
            globalEvents
              .sort((a, b) => b.year - a.year)
              .map((event: GlobalEvent, idx: number) => (
              <View key={idx} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineLine} />
                <Surface style={styles.eventCard} elevation={1}>
                  <View style={styles.eventHeader}>
                    <View style={styles.yearBadge}>
                      <Text variant="labelLarge" style={styles.yearText}>{event.year}</Text>
                    </View>
                  </View>
                  <Text variant="titleLarge" style={styles.eventTitle}>{event.title}</Text>
                  <Text variant="bodyMedium" style={styles.eventDescription}>
                    {event.description}
                  </Text>
                </Surface>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAdd}
        label="Nuovo"
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
    paddingBottom: 100,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#0F172A',
  },
  titleMain: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#6366F1',
  },
  subtitle: {
    opacity: 0.7,
  },
  timeline: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  timelineItem: {
    position: 'relative',
    paddingLeft: 40,
    marginBottom: 24,
  },
  timelineDot: {
    position: 'absolute',
    left: 0,
    top: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#6366F1',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  timelineLine: {
    position: 'absolute',
    left: 7,
    top: 24,
    width: 2,
    bottom: -24,
    backgroundColor: '#E2E8F0',
  },
  eventCard: {
    padding: 16,
    borderRadius: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  yearBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  yearText: {
    color: '#6366F1',
    fontWeight: 'bold',
  },
  eventTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  eventDescription: {
    opacity: 0.8,
    lineHeight: 20,
  },
  emptyCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    opacity: 0.7,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
