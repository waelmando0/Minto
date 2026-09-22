import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

/** Light tap feedback on native; a no-op on web. */
export function tap() {
  if (Platform.OS !== "web") void Haptics.selectionAsync();
}

export function success() {
  if (Platform.OS !== "web") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function warn() {
  if (Platform.OS !== "web") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}
