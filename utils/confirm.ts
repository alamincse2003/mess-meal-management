import { Alert } from "react-native";

export function confirmDelete(itemLabel: string, onConfirm: () => void) {
  Alert.alert(
    `Delete ${itemLabel}?`,
    "This can't be undone.",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onConfirm },
    ],
    { cancelable: true }
  );
}
