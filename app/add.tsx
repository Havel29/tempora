import { addEvent } from '@/lib/db';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, TextInput } from 'react-native-paper';

export default function AddScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const initialDate = params.date ? dayjs(params.date).toDate() : new Date();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(initialDate);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  async function onSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await addEvent({
        title: title.trim(),
        description: description.trim(),
        date: dayjs(date).format('YYYY-MM-DD'),
        source: 'user',
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Nuovo evento" />
        <Appbar.Action icon="content-save" onPress={onSave} disabled={!title.trim()} />
      </Appbar.Header>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <TextInput
          label="Titolo"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
          placeholder="Es: Laurea in Informatica"
        />
        
        <TextInput
          label="Descrizione (opzionale)"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
          placeholder="Aggiungi dettagli da ricordare..."
        />

        <Button
          mode="outlined"
          onPress={() => setShowPicker(true)}
          icon="calendar"
          style={styles.dateButton}
        >
          Data: {dayjs(date).format('D MMMM YYYY')}
        </Button>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(e, d) => {
              setShowPicker(Platform.OS === 'ios');
              if (d) setDate(d);
            }}
          />
        )}

        <Button
          mode="contained"
          onPress={onSave}
          loading={saving}
          disabled={!title.trim() || saving}
          icon="check"
          style={styles.saveButton}
        >
          Salva evento
        </Button>
      </ScrollView>
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
  },
  input: {
    marginBottom: 16,
  },
  dateButton: {
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 8,
  },
});
