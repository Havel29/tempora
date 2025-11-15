import { getGlobalEventsFor } from '@/data/globalEvents';
import dayjs from 'dayjs';
import * as Notifications from 'expo-notifications';

export async function scheduleDailyHistoryNotification(hour: number, minute: number) {
  try {
    // Cancel all existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    const trigger: Notifications.CalendarTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📅 Tempora · Accadde oggi',
        body: 'Scopri quali eventi storici sono accaduti in questo giorno!',
        data: { type: 'daily_history' },
      },
      trigger,
    });

    console.log(`Daily notification scheduled for ${hour}:${minute < 10 ? '0' + minute : minute}`);
    return true;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return false;
  }
}

export async function sendTestNotification() {
  try {
    const today = dayjs().format('YYYY-MM-DD');
    const events = getGlobalEventsFor(today);
    
    let body = 'Questa è una notifica di prova!';
    
    if (events.length > 0) {
      const firstEvent = events[0];
      body = `${firstEvent.year}: ${firstEvent.title}`;
      
      if (events.length > 1) {
        body += ` e altri ${events.length - 1} eventi...`;
      }
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📅 Tempora · Accadde oggi',
        body,
        data: { type: 'test' },
      },
      trigger: { 
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1 
      },
    });

    return true;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
}

export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
    return true;
  } catch (error) {
    console.error('Error cancelling notifications:', error);
    return false;
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
}
