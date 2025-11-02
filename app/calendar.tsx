import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import dayjs from 'dayjs';
import { getAllEventDates } from '@/lib/db';

export default function CalendarScreen() {
  const router = useRouter();
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
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Calendario" />
      </Appbar.Header>

      <Calendar
        current={dayjs().format('YYYY-MM-DD')}
        onDayPress={onDayPress}
        markedDates={marked}
        theme={{
          todayTextColor: '#14B8A6',
          selectedDayBackgroundColor: '#6366F1',
          selectedDayTextColor: '#FFFFFF',
          arrowColor: '#6366F1',
          monthTextColor: '#1E293B',
          textMonthFontWeight: 'bold',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          dotColor: '#6366F1',
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
  calendar: {
    paddingTop: 20,
  },
});
