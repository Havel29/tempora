import { Event, getAllEvents } from '@/lib/db';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Searchbar, Surface, Text } from 'react-native-paper';

type SortMode = 'recent' | 'oldest' | 'alphabetical';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [allMoments, setAllMoments] = useState<Event[]>([]);
  const [filteredResults, setFilteredResults] = useState<Event[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('recent');

  useFocusEffect(
    React.useCallback(() => {
      loadAllMoments();
    }, [])
  );

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      filterResults(searchQuery);
    } else {
      setFilteredResults(sortMoments(allMoments, sortMode));
    }
  }, [searchQuery, allMoments, sortMode]);

  const loadAllMoments = async () => {
    try {
      const moments = await getAllEvents();
      setAllMoments(moments);
      setFilteredResults(sortMoments(moments, sortMode));
    } catch (error) {
      console.error('Error loading moments:', error);
    }
  };

  const sortMoments = (moments: Event[], mode: SortMode): Event[] => {
    const sorted = [...moments];
    switch (mode) {
      case 'recent':
        return sorted.sort((a, b) => b.date.localeCompare(a.date));
      case 'oldest':
        return sorted.sort((a, b) => a.date.localeCompare(b.date));
      case 'alphabetical':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  };

  const filterResults = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    const filtered = allMoments.filter(moment => 
      moment.title.toLowerCase().includes(lowerQuery) ||
      (moment.description && moment.description.toLowerCase().includes(lowerQuery)) ||
      moment.date.includes(query)
    );
    setFilteredResults(sortMoments(filtered, sortMode));
  };

  const handleMomentPress = (date: string) => {
    router.push(`/day/${date}` as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Cerca per titolo, descrizione o data..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          icon="magnify"
        />
        
        {allMoments.length > 0 && (
          <View style={styles.filterContainer}>
            <SegmentedButtons
              value={sortMode}
              onValueChange={(value) => setSortMode(value as SortMode)}
              buttons={[
                { value: 'recent', label: '🕐 Recenti', style: styles.segmentButton },
                { value: 'oldest', label: '⏳ Vecchi', style: styles.segmentButton },
                { value: 'alphabetical', label: '🔤 A-Z', style: styles.segmentButton },
              ]}
              style={styles.segmentedButtons}
            />
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {allMoments.length === 0 ? (
          <Surface style={styles.emptyCard} elevation={0}>
            <Text variant="headlineMedium" style={styles.emptyEmoji}>📝</Text>
            <Text variant="bodyLarge" style={styles.emptyText}>
              Nessun evento salvato
            </Text>
            <Text variant="bodySmall" style={styles.emptySubtext}>
              I tuoi eventi appariranno qui
            </Text>
          </Surface>
        ) : filteredResults.length === 0 && searchQuery.trim().length > 0 ? (
          <Surface style={styles.emptyCard} elevation={0}>
            <Text variant="headlineMedium" style={styles.emptyEmoji}>🔍</Text>
            <Text variant="bodyLarge" style={styles.emptyText}>
              Nessun risultato per "{searchQuery}"
            </Text>
            <Text variant="bodySmall" style={styles.emptySubtext}>
              Prova con altri termini di ricerca
            </Text>
          </Surface>
        ) : (
          <>
            <View style={styles.resultsHeader}>
              <Text variant="titleMedium" style={styles.resultsTitle}>
                {searchQuery.trim().length > 0 ? `Risultati (${filteredResults.length})` : `Tutti gli eventi (${filteredResults.length})`}
              </Text>
            </View>
            {filteredResults.map((moment) => (
              <Card 
                key={moment.id} 
                style={styles.card} 
                mode="elevated"
                onPress={() => handleMomentPress(moment.date)}
              >
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Chip mode="flat" style={styles.dateChip} textStyle={styles.dateText}>
                      📅 {dayjs(moment.date).format('DD MMM YYYY')}
                    </Chip>
                    <Text variant="bodySmall" style={styles.relativeDate}>
                      {getRelativeDate(moment.date)}
                    </Text>
                  </View>
                  <Text variant="titleLarge" style={styles.momentTitle}>
                    {highlightText(moment.title, searchQuery)}
                  </Text>
                  {moment.description && (
                    <Text variant="bodyMedium" style={styles.momentDescription} numberOfLines={2}>
                      {highlightText(moment.description, searchQuery)}
                    </Text>
                  )}
                </Card.Content>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const getRelativeDate = (date: string): string => {
  const diff = dayjs().diff(dayjs(date), 'day');
  if (diff === 0) return 'Oggi';
  if (diff === 1) return 'Ieri';
  if (diff === -1) return 'Domani';
  if (diff < 0) return `Tra ${Math.abs(diff)} giorni`;
  if (diff < 7) return `${diff} giorni fa`;
  if (diff < 30) return `${Math.floor(diff / 7)} settimane fa`;
  if (diff < 365) return `${Math.floor(diff / 30)} mesi fa`;
  return `${Math.floor(diff / 365)} anni fa`;
};

const highlightText = (text: string, query: string): string => {
  // For now, just return the text. In a real app, you'd use Text components with different styles
  return text;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingTop: 70,
  },
  searchBar: {
    elevation: 2,
    marginBottom: 12,
  },
  filterContainer: {
    marginTop: 4,
  },
  segmentedButtons: {
    marginVertical: 0,
  },
  segmentButton: {
    paddingVertical: 0,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsTitle: {
    fontWeight: 'bold',
    color: '#1E293B',
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateChip: {
    backgroundColor: '#EEF2FF',
  },
  dateText: {
    color: '#6366F1',
    fontWeight: '600',
    fontSize: 12,
  },
  relativeDate: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
  momentTitle: {
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 26,
  },
  momentDescription: {
    opacity: 0.8,
    lineHeight: 22,
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
