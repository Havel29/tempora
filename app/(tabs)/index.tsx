import { getGlobalEventsFor, GlobalEvent } from '@/data/globalEvents';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { deleteEvent, Event, getEventsByDate, initDb } from '@/lib/db';
import dayjs from 'dayjs';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Chip, FAB, IconButton, Surface, Text } from 'react-native-paper';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const today = dayjs();
  const todayStr = today.format('YYYY-MM-DD');
  const globalEvents = useMemo(() => getGlobalEventsFor(todayStr), [todayStr]);
  const [userEvents, setUserEvents] = useState<Event[]>([]);

  useEffect(() => {
    initDb();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadUserEvents();
    }, [todayStr])
  );

  async function loadUserEvents() {
    const events = await getEventsByDate(todayStr);
    setUserEvents(events);
  }

  async function handleDeleteUserEvent(id: number) {
    await deleteEvent(id);
    await loadUserEvents();
  }

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

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <Surface style={[styles.quickStatCard, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }]} elevation={1}>
            <Text variant="bodySmall" style={styles.quickStatLabel}>Oggi</Text>
            <Text variant="titleLarge" style={styles.quickStatValue}>
              {userEvents.length + globalEvents.length}
            </Text>
            <Text variant="bodySmall" style={styles.quickStatSubtext}>eventi</Text>
          </Surface>
          <Surface style={[styles.quickStatCard, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }]} elevation={1}>
            <Text variant="bodySmall" style={styles.quickStatLabel}>I tuoi</Text>
            <Text variant="titleLarge" style={styles.quickStatValue}>
              {userEvents.length}
            </Text>
            <Text variant="bodySmall" style={styles.quickStatSubtext}>eventi</Text>
          </Surface>
          <Surface style={[styles.quickStatCard, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }]} elevation={1}>
            <Text variant="bodySmall" style={styles.quickStatLabel}>Storici</Text>
            <Text variant="titleLarge" style={styles.quickStatValue}>
              {globalEvents.length}
            </Text>
            <Text variant="bodySmall" style={styles.quickStatSubtext}>eventi</Text>
          </Surface>
        </View>

        <View style={styles.timeline}>
          {/* User Events Section */}
          {userEvents.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: isDark ? '#F1F5F9' : '#1E293B' }]}>✨ I tuoi eventi</Text>
                <Chip mode="flat" textStyle={{ color: isDark ? '#E2E8F0' : '#64748B', fontWeight: 'bold' }} style={[styles.countChip, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>{userEvents.length}</Chip>
              </View>
              {userEvents.map((event: Event) => (
                <View key={event.id} style={styles.timelineItem}>
                  <View style={[styles.timelineDot, styles.userDot]} />
                  <View style={styles.timelineLine} />
                  <Surface style={[styles.eventCard, styles.userEventCard, { backgroundColor: isDark ? '#064E3B' : '#F0FDF4' }]} elevation={2}>
                    <View style={styles.eventHeader}>
                      <View style={[styles.userBadge, { backgroundColor: isDark ? '#065F46' : '#D1FAE5' }]}>
                        <Text variant="labelMedium" style={[styles.userBadgeText, { color: isDark ? '#D1FAE5' : '#059669' }]}>🎯 Personale</Text>
                      </View>
                      <IconButton
                        icon="delete"
                        size={20}
                        onPress={() => handleDeleteUserEvent(event.id!)}
                        style={styles.deleteBtn}
                      />
                    </View>
                    <Text variant="titleLarge" style={styles.eventTitle}>{event.title}</Text>
                    {event.description && (
                      <Text variant="bodyMedium" style={styles.eventDescription}>
                        {event.description}
                      </Text>
                    )}
                  </Surface>
                </View>
              ))}
            </View>
          )}

          {/* Global Events Section */}
          {globalEvents.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: isDark ? '#F1F5F9' : '#1E293B' }]}>🌍 Accadde oggi</Text>
                <Chip mode="flat" textStyle={{ color: isDark ? '#E2E8F0' : '#64748B', fontWeight: 'bold' }} style={[styles.countChip, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>{globalEvents.length}</Chip>
              </View>
              {globalEvents
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
              ))}
            </View>
          )}

          {/* Empty State */}
          {userEvents.length === 0 && globalEvents.length === 0 && (
            <Surface style={styles.emptyCard} elevation={0}>
              <Text variant="headlineMedium" style={styles.emptyEmoji}>📅</Text>
              <Text variant="bodyLarge" style={styles.emptyText}>
                Nessun evento per oggi
              </Text>
              <Text variant="bodySmall" style={styles.emptySubtext}>
                Aggiungi il tuo primo evento!
              </Text>
            </Surface>
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
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickStatLabel: {
    opacity: 0.6,
    marginBottom: 4,
    fontSize: 11,
  },
  quickStatValue: {
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 2,
  },
  quickStatSubtext: {
    opacity: 0.5,
    fontSize: 10,
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
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    lineHeight: 28,
  },
  countChip: {
    backgroundColor: '#F1F5F9',
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
  userDot: {
    backgroundColor: '#10B981',
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
  userEventCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  userBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userBadgeText: {
    fontWeight: 'bold',
    fontSize: 12,
    lineHeight: 20,
  },
  deleteBtn: {
    margin: 0,
  },
  eventTitle: {
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 28,
  },
  eventDescription: {
    opacity: 0.8,
    lineHeight: 22,
  },
  emptyCard: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
    lineHeight: 72,
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
