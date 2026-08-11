import { StyleSheet, View, type ViewProps } from "react-native";

export type CardProps = ViewProps;

export function Card({ style, ...rest }: CardProps) {
  return <View style={[styles.card, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    backgroundColor: "#F3F4F6",
  },
});
