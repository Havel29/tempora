import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import dayjs from 'dayjs';
import { getAllEventDates } from '@/lib/db';

export default function CalendarTabScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [marked, setMarked] = useState<Record<string, any>>({});

  useEffect(() => {
    loadMarkedDates();
  }, []);

  async function loadMarkedDates() {
    const rows = await getAllEventDates();
    const m: Record<string, any> = {};
    rows.forEach((r: any) => {
      m[r.date] = {
        marked: true,
        dotColor: '#6366F1',
      };
    });
    setMarked(m);
  }

  function onDayPress(day: any) {
    router.push(`/day/${day.dateString}` as any);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>📅 Calendario</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Tocca un giorno per vedere i dettagli
        </Text>
      </View>

      <Calendar
        current={dayjs().format('YYYY-MM-DD')}
        onDayPress={onDayPress}
        markedDates={marked}
        theme={{
          backgroundColor: theme.colors.background,
          calendarBackground: theme.colors.background,
          todayTextColor: theme.colors.secondary,
          selectedDayBackgroundColor: theme.colors.primary,
          selectedDayTextColor: '#FFFFFF',
          arrowColor: theme.colors.primary,
          monthTextColor: theme.colors.onBackground,
          dayTextColor: theme.colors.onBackground,
          textDisabledColor: theme.colors.outline,
          textMonthFontWeight: 'bold',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          dotColor: theme.colors.primary,
          selectedDotColor: '#FFFFFF',
        }}
        style={styles.calendar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
  },
  calendar: {
    paddingHorizontal: 20,
  },
});
