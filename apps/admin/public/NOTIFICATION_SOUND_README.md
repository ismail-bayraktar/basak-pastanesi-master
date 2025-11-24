# Notification Sound Setup

## Option 1: Add Your Own Sound File (Recommended)

Place a notification sound file named `notification.mp3` in the `admin/public` directory.

**Recommended Sources:**
- https://freesound.org/ (free notification sounds)
- https://notificationsounds.com/ (free notification sounds)
- Your own custom notification sound

**Format:** MP3 (recommended for browser compatibility)
**Duration:** 1-3 seconds recommended
**File Location:** `admin/public/notification.mp3`

## Option 2: Use Built-in Browser Beep (Current Implementation)

The notification system will gracefully fail if the audio file is not found. The Web Audio API fallback in `useNotifications.js` will generate a simple beep sound.

## Testing

After adding the sound file:
1. Enable "Sipariş Bildirimleri" in General Settings
2. Enable "Bildirim Sesi" in General Settings
3. Create a test order
4. You should hear the notification sound

## Troubleshooting

If you don't hear the notification sound:
1. Check browser console for errors
2. Verify file exists at `admin/public/notification.mp3`
3. Check browser audio permissions
4. Verify notification settings are enabled in General Settings
