import { Alert, Platform } from "react-native";

/** Shows a simple message; Alert.alert does nothing on web, so use alert() there. */
export function showMessage(title: string, message: string) {
  if (Platform.OS === "web") {
    globalThis.alert?.(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
