import { getEventStats } from '@/lib/db';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, ProgressBar, Surface, Text } from 'react-native-paper';

type Stats = {
  total: number;
  daysWithEvents: number;
  oldestDate: string | null;
  newestDate: string | null;
  currentStreak: number;
  longestStreak: number;
  thisWeek: number;
  thisMonth: number;
  thisYear: number;
};

export default function StatsScreen() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    daysWithEvents: 0,
    oldestDate: null,
    newestDate: null,
    currentStreak: 0,
    longestStreak: 0,
    thisWeek: 0,
    thisMonth: 0,
    thisYear: 0,
  });

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      const data = await getEventStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const StatCard = ({ title, value, icon, subtitle }: { title: string; value: string; icon: string; subtitle?: string }) => (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.statHeader}>
          <Text variant="bodyLarge" style={styles.statIcon}>{icon}</Text>
        </View>
        <Text variant="displaySmall" style={styles.statValue}>{value}</Text>
        <Text variant="bodyMedium" style={styles.statTitle}>{title}</Text>
        {subtitle && <Text variant="bodySmall" style={styles.statSubtitle}>{subtitle}</Text>}
      </Card.Content>
    </Card>
  );

  const StreakCard = () => (
    <Card style={[styles.card, styles.streakCard]} mode="elevated">
      <Card.Content>
        <View style={styles.streakHeader}>
          <View>
            <Text variant="titleLarge" style={styles.streakTitle}>🔥 Serie attuale</Text>
            <Text variant="bodySmall" style={styles.streakSubtext}>
              {stats.currentStreak > 0 ? 'Continua così!' : 'Aggiungi un evento oggi!'}
            </Text>
          </View>
          <View style={styles.streakBadge}>
            <Text variant="headlineLarge" style={styles.streakNumber}>{stats.currentStreak}</Text>
            <Text variant="bodySmall" style={styles.streakLabel}>giorni</Text>
          </View>
        </View>
        <View style={styles.progressContainer}>
          <Text variant="bodySmall" style={styles.progressLabel}>
            Record personale: {stats.longestStreak} giorni
          </Text>
          <ProgressBar 
            progress={stats.longestStreak > 0 ? stats.currentStreak / stats.longestStreak : 0} 
            color="#10B981"
            style={styles.progressBar}
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>📊 Statistiche</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Panoramica dei tuoi eventi
          </Text>
        </View>

        {stats.total > 0 && <StreakCard />}

        <View style={styles.gridRow}>
          <View style={styles.gridItem}>
            <StatCard 
              title="Questa settimana" 
              value={stats.thisWeek.toString()} 
              icon="📆"
            />
          </View>
          <View style={styles.gridItem}>
            <StatCard 
              title="Questo mese" 
              value={stats.thisMonth.toString()} 
              icon="🗓️"
            />
          </View>
        </View>

        <StatCard 
          title="Eventi totali" 
          value={stats.total.toString()} 
          icon="📝"
          subtitle={`Quest'anno: ${stats.thisYear}`}
        />

        <StatCard 
          title="Giorni con eventi" 
          value={stats.daysWithEvents.toString()} 
          icon="📅"
          subtitle={stats.daysWithEvents > 0 ? `Media: ${(stats.total / stats.daysWithEvents).toFixed(1)} eventi/giorno` : undefined}
        />

        {stats.oldestDate && (
          <StatCard 
            title="Evento più vecchio" 
            value={dayjs(stats.oldestDate).format('DD/MM/YYYY')} 
            icon="⏳"
            subtitle={`${dayjs().diff(dayjs(stats.oldestDate), 'day')} giorni fa`}
          />
        )}

        {stats.newestDate && stats.newestDate !== dayjs().format('YYYY-MM-DD') && (
          <StatCard 
            title="Ultimo evento" 
            value={dayjs(stats.newestDate).format('DD/MM/YYYY')} 
            icon="✨"
            subtitle={`${dayjs().diff(dayjs(stats.newestDate), 'day')} giorni fa`}
          />
        )}

        {stats.total === 0 && (
          <Surface style={styles.emptyCard} elevation={0}>
            <Text variant="headlineMedium" style={styles.emptyEmoji}>📊</Text>
            <Text variant="bodyLarge" style={styles.emptyText}>
              Inizia ad aggiungere eventi per vedere le tue statistiche!
            </Text>
            <Text variant="bodySmall" style={styles.emptySubtext}>
              Traccia i tuoi ricordi e costruisci una serie di giorni consecutivi
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
  streakCard: {
    backgroundColor: '#ECFDF5',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  statHeader: {
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 32,
    lineHeight: 40,
  },
  statValue: {
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 4,
  },
  statTitle: {
    opacity: 0.7,
  },
  statSubtitle: {
    opacity: 0.5,
    marginTop: 4,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakTitle: {
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  streakSubtext: {
    opacity: 0.7,
    color: '#059669',
  },
  streakBadge: {
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  streakNumber: {
    fontWeight: 'bold',
    color: '#059669',
    fontSize: 36,
    lineHeight: 42,
  },
  streakLabel: {
    color: '#059669',
    opacity: 0.7,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabel: {
    opacity: 0.7,
    marginBottom: 8,
    color: '#059669',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1FAE5',
  },
  gridRow: {
    flexDirection: 'row',
    marginHorizontal: -8,
    marginBottom: 16,
  },
  gridItem: {
    flex: 1,
    paddingHorizontal: 8,
  },
  emptyCard: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
    lineHeight: 72,
  },
  emptyText: {
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    opacity: 0.5,
    textAlign: 'center',
  },
});
