// Water reminder notifications

export interface NotificationService {
  requestPermission(): Promise<boolean>;
  scheduleWaterReminders(): void;
  showGoalReachedNotification(): void;
  clearWaterReminders(): void;
}

class WebNotificationService implements NotificationService {
  private reminderIntervals: NodeJS.Timeout[] = [];

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
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
  }

  scheduleWaterReminders(): void {
    this.clearWaterReminders();
    
    const reminderMessages = [
      "💧 Stay hydrated! Time for some water 🌊",
      "🚰 Don't forget to drink water! Your body needs it ✨",
      "💦 Water break time! Keep that glow going 💫",
      "🌊 Hydration check! Drink some water to feel amazing 💙",
      "💧 Your skin will thank you! Time for water 🌸",
      "🚰 Stay healthy and hydrated! Water time 🌿"
    ];

    // Schedule reminders every hour (3600000 ms)
    const reminderInterval = setInterval(() => {
      if (Notification.permission === 'granted') {
        const randomMessage = reminderMessages[Math.floor(Math.random() * reminderMessages.length)];
        new Notification('Hydration Reminder', {
          body: randomMessage,
          icon: '/water-icon.png', // Add a water icon to public folder
          badge: '/water-badge.png',
          tag: 'water-reminder',
          requireInteraction: false,
          silent: false
        });
      }
    }, 3600000); // 1 hour = 3600000 ms

    this.reminderIntervals.push(reminderInterval);
  }

  showGoalReachedNotification(): void {
    if (Notification.permission === 'granted') {
      new Notification('Hydration Goal Achieved! 🎉', {
        body: '🏆 Amazing! You\'ve reached your 3L water goal today! Keep up the great work! 💪✨',
        icon: '/celebration-icon.png',
        badge: '/achievement-badge.png',
        tag: 'goal-reached',
        requireInteraction: true,
        silent: false
      });
    }
  }

  clearWaterReminders(): void {
    this.reminderIntervals.forEach(interval => clearInterval(interval));
    this.reminderIntervals = [];
  }
}

export const notificationService = new WebNotificationService();

// Hook to use notifications in React components
import { useEffect } from 'react';

export function useWaterReminders(waterIntake: number, goalMl: number) {
  useEffect(() => {
    // Request permission when component mounts
    notificationService.requestPermission().then(granted => {
      if (granted) {
        notificationService.scheduleWaterReminders();
      }
    });

    // Clean up on unmount
    return () => {
      notificationService.clearWaterReminders();
    };
  }, []);

  useEffect(() => {
    // Show congratulatory notification when goal is reached
    if (waterIntake >= goalMl && waterIntake > 0) {
      notificationService.showGoalReachedNotification();
    }
  }, [waterIntake, goalMl]);
}