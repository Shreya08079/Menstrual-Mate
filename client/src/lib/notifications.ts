// Water reminder notifications

export interface NotificationService {
  requestPermission(): Promise<boolean>;
  scheduleWaterReminders(): void;
  showGoalReachedNotification(): void;
  clearWaterReminders(): void;
  scheduleExerciseReminders(): void;
  clearExerciseReminders(): void;
}

class WebNotificationService implements NotificationService {
  private reminderIntervals: NodeJS.Timeout[] = [];
  private exerciseReminderIntervals: NodeJS.Timeout[] = [];

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    console.log('Current notification permission:', Notification.permission);

    if (Notification.permission === 'granted') {
      console.log('Notification permission already granted');
      return true;
    }

    if (Notification.permission !== 'denied') {
      console.log('Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);
      return permission === 'granted';
    }

    console.log('Notification permission denied');
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

    console.log('Scheduling water reminders...');

    // Schedule reminders every hour (3600000 ms) - for testing, use 10 seconds
    const reminderInterval = setInterval(() => {
      console.log('Checking notification permission for reminder...');
      if (Notification.permission === 'granted') {
        const randomMessage = reminderMessages[Math.floor(Math.random() * reminderMessages.length)];
        console.log('Sending notification:', randomMessage);
        new Notification('Hydration Reminder', {
          body: randomMessage,
          tag: 'water-reminder',
          requireInteraction: false,
          silent: false
        });
      } else {
        console.log('Notification permission not granted:', Notification.permission);
      }
    }, 3600000); // 1 hour = 3600000 ms

    this.reminderIntervals.push(reminderInterval);
    console.log('Water reminder scheduled');
  }

  showGoalReachedNotification(): void {
    console.log('Attempting to show goal reached notification...');
    if (Notification.permission === 'granted') {
      console.log('Showing goal achieved notification');
      new Notification('Hydration Goal Achieved! 🎉', {
        body: '🏆 Amazing! You\'ve reached your 3L water goal today! Keep up the great work! 💪✨',
        tag: 'goal-reached',
        requireInteraction: true,
        silent: false
      });
    } else {
      console.log('Cannot show notification - permission not granted:', Notification.permission);
    }
  }

  clearWaterReminders(): void {
    this.reminderIntervals.forEach(interval => clearInterval(interval));
    this.reminderIntervals = [];
  }

  scheduleExerciseReminders(): void {
    this.clearExerciseReminders();
    const exerciseMessages = [
      "🏃‍♀️ Time to move! Try a quick stretch or walk.",
      "🤸‍♂️ Exercise break! A little movement goes a long way.",
      "🧘‍♀️ Take a moment for some deep breathing or yoga.",
      "💪 Boost your energy! Do a few squats or dance to your favorite song.",
      "🚶‍♀️ Step away from your screen and move your body!"
    ];
    // Every 3 hours (10800000 ms) - for testing, use 30 seconds
    const exerciseInterval = setInterval(() => {
      if (Notification.permission === 'granted') {
        const randomMessage = exerciseMessages[Math.floor(Math.random() * exerciseMessages.length)];
        new Notification('Exercise Reminder', {
          body: randomMessage,
          tag: 'exercise-reminder',
          requireInteraction: false,
          silent: false
        });
      }
    }, 10800000); // 3 hours = 10800000 ms
    this.exerciseReminderIntervals.push(exerciseInterval);
    console.log('Exercise reminder scheduled');
  }

  clearExerciseReminders(): void {
    this.exerciseReminderIntervals.forEach(interval => clearInterval(interval));
    this.exerciseReminderIntervals = [];
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
        notificationService.scheduleExerciseReminders();
      }
    });

    // Clean up on unmount
    return () => {
      notificationService.clearWaterReminders();
      notificationService.clearExerciseReminders();
    };
  }, []);

  useEffect(() => {
    // Show congratulatory notification when goal is reached
    if (waterIntake >= goalMl && waterIntake > 0) {
      notificationService.showGoalReachedNotification();
    }
  }, [waterIntake, goalMl]);
}