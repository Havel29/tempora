import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Surface } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { getAllEventDates, getEventsByDate } from '@/lib/db';
import dayjs from 'dayjs';
import { useFocusEffect } from '@react-navigation/native';

export default function StatsScreen() {
  const [totalMoments, setTotalMoments] = useState(0);
  const [oldestMoment, setOldestMoment] = useState<string | null>(null);
  const [mostRecentMoment, setMostRecentMoment] = useState<string | null>(null);
  const [daysWithMoments, setDaysWithMoments] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      const dates = await getAllEventDates();
      setDaysWithMoments(dates.length);
      
      let total = 0;
      let oldest: string | null = null;
      let newest: string | null = null;

      for (const dateObj of dates) {
        const events = await getEventsByDate(dateObj.date);
        total += events.length;

        for (const event of events) {
          if (!oldest || event.date < oldest) {
            oldest = event.date;
          }
          if (!newest || event.date > newest) {
            newest = event.date;
          }
        }
      }

      setTotalMoments(total);
      setOldestMoment(oldest);
      setMostRecentMoment(newest);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const StatCard = ({ title, value, icon }: { title: string; value: string; icon: string }) => (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.statHeader}>
          <Text variant="bodyLarge" style={styles.statIcon}>{icon}</Text>
        </View>
        <Text variant="displaySmall" style={styles.statValue}>{value}</Text>
        <Text variant="bodyMedium" style={styles.statTitle}>{title}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>📊 Statistiche</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Panoramica dei tuoi momenti
          </Text>
        </View>

        <StatCard 
          title="Momenti totali" 
          value={totalMoments.toString()} 
          icon="📝"
        />

        <StatCard 
          title="Giorni con momenti" 
          value={daysWithMoments.toString()} 
          icon="📅"
        />

        {oldestMoment && (
          <StatCard 
            title="Momento più vecchio" 
            value={dayjs(oldestMoment).format('DD/MM/YYYY')} 
            icon="⏳"
          />
        )}

        {mostRecentMoment && (
          <StatCard 
            title="Momento più recente" 
            value={dayjs(mostRecentMoment).format('DD/MM/YYYY')} 
            icon="✨"
          />
        )}

        {totalMoments === 0 && (
          <Surface style={styles.emptyCard} elevation={0}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              Inizia ad aggiungere momenti per vedere le tue statistiche!
            </Text>
          </Surface>
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
  statHeader: {
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 32,
  },
  statValue: {
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 4,
  },
  statTitle: {
    opacity: 0.7,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    opacity: 0.8,
    textAlign: 'center',
  },
});
