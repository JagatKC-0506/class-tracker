import { LocalNotifications } from '@capacitor/local-notifications';
import type { ScheduleOptions } from '@capacitor/local-notifications';
import type { ClassEvent } from '../types';

// Initialize notifications - request permission and setup listeners
export const initializeNotifications = async (): Promise<boolean> => {
  try {
    // Check current permission status
    const permStatus = await LocalNotifications.checkPermissions();
    
    if (permStatus.display === 'prompt') {
      const result = await LocalNotifications.requestPermissions();
      if (result.display !== 'granted') {
        console.log('Notification permission denied');
        return false;
      }
    } else if (permStatus.display !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }

    // Set up notification click listener
    await LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      console.log('Notification action performed:', notification);
    });

    return true;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    // Fallback to web notifications if Capacitor fails
    return await requestWebNotificationPermission();
  }
};

// Request web notification permission (fallback)
const requestWebNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

// Schedule a notification for an event
export const scheduleEventNotification = async (event: ClassEvent): Promise<void> => {
  if (!event.reminderEnabled) return;

  try {
    const eventDate = new Date(event.date);
    
    // If event has a time, use it
    if (event.time) {
      const [hours, minutes] = event.time.split(':').map(Number);
      eventDate.setHours(hours, minutes, 0, 0);
    } else {
      // Default to 9:00 AM
      eventDate.setHours(9, 0, 0, 0);
    }

    // Subtract reminder time (default 30 minutes before)
    const reminderMinutes = event.reminderTime || 30;
    const notificationTime = new Date(eventDate.getTime() - reminderMinutes * 60 * 1000);

    // Don't schedule if the notification time has passed
    if (notificationTime <= new Date()) {
      console.log('Notification time has passed, not scheduling');
      return;
    }

    // Generate a unique numeric ID from the event ID string
    const notificationId = hashStringToNumber(event.id);

    const scheduleOptions: ScheduleOptions = {
      notifications: [
        {
          id: notificationId,
          title: `📅 ${getEventTypeEmoji(event.type)} ${event.title}`,
          body: `${event.type.charAt(0).toUpperCase() + event.type.slice(1)} in ${reminderMinutes} minutes!`,
          schedule: { at: notificationTime },
          extra: { eventId: event.id },
          sound: 'default',
          smallIcon: 'ic_notification',
          iconColor: '#667eea',
        },
      ],
    };

    await LocalNotifications.schedule(scheduleOptions);
    console.log(`Scheduled notification for event "${event.title}" at ${notificationTime}`);
  } catch (error) {
    console.error('Error scheduling notification:', error);
    // Try web notification as fallback for same-day events
    scheduleWebNotification(event);
  }
};

// Cancel a scheduled notification
export const cancelEventNotification = async (eventId: string): Promise<void> => {
  try {
    const notificationId = hashStringToNumber(eventId);
    await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
    console.log(`Cancelled notification for event ${eventId}`);
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
};

// Reschedule all event notifications
export const rescheduleAllNotifications = async (events: ClassEvent[]): Promise<void> => {
  try {
    // Cancel all existing notifications first
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    // Schedule new notifications for enabled events
    for (const event of events) {
      if (event.reminderEnabled) {
        await scheduleEventNotification(event);
      }
    }
    
    console.log(`Rescheduled notifications for ${events.filter(e => e.reminderEnabled).length} events`);
  } catch (error) {
    console.error('Error rescheduling notifications:', error);
  }
};

// Send immediate notification (for testing or same-day events)
export const sendImmediateNotification = async (title: string, body: string): Promise<void> => {
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Date.now(),
          title,
          body,
          schedule: { at: new Date(Date.now() + 1000) }, // 1 second from now
          sound: 'default',
        },
      ],
    });
  } catch (error) {
    console.error('Error sending immediate notification:', error);
    // Fallback to web notification
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icons/icon-192x192.png' });
    }
  }
};

// Web notification fallback
const scheduleWebNotification = (event: ClassEvent): void => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const eventDate = new Date(event.date);
  if (event.time) {
    const [hours, minutes] = event.time.split(':').map(Number);
    eventDate.setHours(hours, minutes, 0, 0);
  } else {
    eventDate.setHours(9, 0, 0, 0);
  }

  const reminderMinutes = event.reminderTime || 30;
  const notificationTime = eventDate.getTime() - reminderMinutes * 60 * 1000;
  const delay = notificationTime - Date.now();

  if (delay > 0 && delay < 24 * 60 * 60 * 1000) { // Only schedule if within 24 hours
    setTimeout(() => {
      new Notification(`📅 ${event.title}`, {
        body: `${event.type.charAt(0).toUpperCase() + event.type.slice(1)} starting soon!`,
        icon: '/icons/icon-192x192.png',
      });
    }, delay);
  }
};

// Helper: Convert string to numeric ID
const hashStringToNumber = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Helper: Get emoji for event type
const getEventTypeEmoji = (type: string): string => {
  switch (type) {
    case 'exam': return '📝';
    case 'quiz': return '✏️';
    case 'presentation': return '🎤';
    case 'project': return '📊';
    case 'holiday': return '🎉';
    default: return '📅';
  }
};
