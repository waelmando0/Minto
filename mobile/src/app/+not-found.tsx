import { View } from "react-native";
import { Link, Stack } from "expo-router";

import { Text } from "@/components/text";
import { makeStyles, useColors } from "@/theme/theme";

export default function NotFound() {
  const colors = useColors();
  const styles = useStyles();
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View style={styles.root}>
        <Text variant="title">This screen doesn&apos;t exist.</Text>
        <Link href="/" style={styles.link}>
          <Text color={colors.violet} weight="semibold">
            Go to Home
          </Text>
        </Link>
      </View>
    </>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, backgroundColor: colors.background },
  link: { paddingVertical: 12 },
}));
