import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Searchbar, Card, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import { getAllEventDates, getEventsByDate, Event } from '@/lib/db';
import { getGlobalEventsFor, GlobalEvent } from '@/data/globalEvents';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [allMoments, setAllMoments] = useState<Event[]>([]);
  const [filteredResults, setFilteredResults] = useState<Event[]>([]);
  const [globalResults, setGlobalResults] = useState<GlobalEvent[]>([]);

  useEffect(() => {
    loadAllMoments();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      filterResults(searchQuery);
    } else {
      setFilteredResults([]);
      setGlobalResults([]);
    }
  }, [searchQuery, allMoments]);

  const loadAllMoments = async () => {
    try {
      const dates = await getAllEventDates();
      const moments: Event[] = [];
      
      for (const dateObj of dates) {
        const events = await getEventsByDate(dateObj.date);
        moments.push(...events);
      }
      
      setAllMoments(moments);
    } catch (error) {
      console.error('Error loading moments:', error);
    }
  };

  const filterResults = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    // Filter user moments
    const filtered = allMoments.filter(moment => 
      moment.title.toLowerCase().includes(lowerQuery) ||
      (moment.description && moment.description.toLowerCase().includes(lowerQuery))
    );
    setFilteredResults(filtered);

    // Search global events for today
    const today = dayjs().format('YYYY-MM-DD');
    const globals = getGlobalEventsFor(today);
    const filteredGlobals = globals.filter(event =>
      event.title.toLowerCase().includes(lowerQuery) ||
      event.description.toLowerCase().includes(lowerQuery)
    );
    setGlobalResults(filteredGlobals);
  };

  const handleMomentPress = (date: string) => {
    router.push(`/day/${date}` as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Cerca momenti ed eventi..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {searchQuery.trim().length === 0 ? (
          <Surface style={styles.emptyCard} elevation={0}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              🔍
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Cerca tra i tuoi momenti e gli eventi storici
            </Text>
          </Surface>
        ) : (
          <>
            {filteredResults.length > 0 && (
              <View style={styles.section}>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  I Tuoi Momenti ({filteredResults.length})
                </Text>
                {filteredResults.map((moment) => (
                  <Card 
                    key={moment.id} 
                    style={styles.card} 
                    mode="elevated"
                    onPress={() => handleMomentPress(moment.date)}
                  >
                    <Card.Content>
                      <View style={styles.cardHeader}>
                        <View style={styles.dateContainer}>
                          <Text variant="labelSmall" style={styles.dateLabel}>
                            {dayjs(moment.date).format('DD MMM YYYY')}
                          </Text>
                        </View>
                      </View>
                      <Text variant="titleMedium" style={styles.momentTitle}>
                        {moment.title}
                      </Text>
                      {moment.description && (
                        <Text variant="bodyMedium" style={styles.momentDescription}>
                          {moment.description}
                        </Text>
                      )}
                    </Card.Content>
                  </Card>
                ))}
              </View>
            )}

            {globalResults.length > 0 && (
              <View style={styles.section}>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Eventi Storici ({globalResults.length})
                </Text>
                {globalResults.map((event, idx) => (
                  <Card key={idx} style={styles.card} mode="elevated">
                    <Card.Content>
                      <View style={styles.cardHeader}>
                        <View style={styles.yearBadge}>
                          <Text variant="labelSmall" style={styles.yearText}>
                            {event.year}
                          </Text>
                        </View>
                      </View>
                      <Text variant="titleMedium" style={styles.momentTitle}>
                        {event.title}
                      </Text>
                      <Text variant="bodyMedium" style={styles.momentDescription}>
                        {event.description}
                      </Text>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            )}

            {filteredResults.length === 0 && globalResults.length === 0 && (
              <Surface style={styles.emptyCard} elevation={0}>
                <Text variant="bodyLarge" style={styles.emptyText}>
                  Nessun risultato trovato
                </Text>
                <Text variant="bodyMedium" style={styles.emptySubtext}>
                  Prova con parole chiave diverse
                </Text>
              </Surface>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingTop: 90,
  },
  searchBar: {
    elevation: 2,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateContainer: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateLabel: {
    color: '#6366F1',
    fontWeight: 'bold',
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
  momentTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  momentDescription: {
    opacity: 0.8,
    lineHeight: 20,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptySubtext: {
    opacity: 0.6,
    textAlign: 'center',
  },
});
