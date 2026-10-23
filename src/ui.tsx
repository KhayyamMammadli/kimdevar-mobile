import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TextInputProps,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
export const C = {
  purple: "#5426A6",
  lime: "#B8EF47",
  ink: "#261C35",
  muted: "#8F829F",
  bg: "#F6F5FA",
  line: "#EBE5F1",
  soft: "#EEE6F8",
  green: "#668A27",
};
export function I({
  name,
  size = 21,
  color = C.purple,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  size?: number;
  color?: string;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}
export function T({
  children,
  style,
  ...rest
}: React.ComponentProps<typeof Text>) {
  return (
    <Text {...rest} style={[s.text, style]}>
      {children}
    </Text>
  );
}
export function Button({
  title,
  onPress,
  secondary = false,
  disabled = false,
  icon,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof I>["name"];
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        (disabled || pressed) && { opacity: 0.55 },
      ]}
    >
      <T style={[s.buttonText, secondary && { color: C.purple }]}>{title}</T>
      {icon && (
        <I name={icon} size={17} color={secondary ? C.purple : "#fff"} />
      )}
    </Pressable>
  );
}
export function Card({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}) {
  return (
    <Pressable disabled={!onPress} onPress={onPress} style={[s.card, style]}>
      {children}
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ marginBottom: 15 }}>
      <T style={s.label}>{label}</T>
      <TextInput
        placeholderTextColor="#B1A5BD"
        {...props}
        style={[
          s.input,
          props.multiline && { minHeight: 90, textAlignVertical: "top" },
          props.style,
        ]}
      />
    </View>
  );
}
export function Chips({
  values,
  value,
  onChange,
  multi = false,
}: {
  values: string[];
  value: string | string[];
  onChange: (v: string) => void;
  multi?: boolean;
}) {
  return (
    <View style={s.chips}>
      {values.map((v) => {
        const active = multi ? (value as string[]).includes(v) : v === value;
        return (
          <Pressable
            key={v}
            onPress={() => onChange(v)}
            style={[s.chip, active && s.chipActive]}
          >
            <T
              style={{
                fontSize: 12,
                color: active ? C.purple : C.muted,
                fontWeight: active ? "700" : "500",
              }}
            >
              {v}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}
export function Tag({
  children,
  green = false,
}: {
  children: React.ReactNode;
  green?: boolean;
}) {
  return (
    <View style={[s.tag, green && { backgroundColor: "#EDF6DF" }]}>
      <T
        style={{
          fontSize: 10,
          color: green ? C.green : C.purple,
          fontWeight: "600",
        }}
      >
        {children}
      </T>
    </View>
  );
}
export function Note({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.note}>
      <I name="information-circle-outline" size={19} />
      <T style={{ fontSize: 12, color: "#8C79A3", lineHeight: 19, flex: 1 }}>
        {children}
      </T>
    </View>
  );
}
export function Empty({
  title,
  text,
  action,
}: {
  title: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <I name="cube-outline" size={38} />
      </View>
      <T style={s.h2}>{title}</T>
      {text && <T style={[s.subtitle, { textAlign: "center" }]}>{text}</T>}
      {action}
    </View>
  );
}
export function Section({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={[s.between, { marginTop: 24, marginBottom: 13 }]}>
      <T style={s.h3}>{title}</T>
      {action && (
        <Pressable onPress={onPress}>
          <T style={s.link}>{action}</T>
        </Pressable>
      )}
    </View>
  );
}
export function Row({
  icon,
  title,
  sub,
  onPress,
  end,
}: {
  icon: React.ComponentProps<typeof I>["name"];
  title: string;
  sub?: string;
  onPress?: () => void;
  end?: React.ReactNode;
}) {
  return (
    <Pressable onPress={onPress} style={s.listRow}>
      <View style={s.listIcon}>
        <I name={icon} size={19} />
      </View>
      <View style={{ flex: 1 }}>
        <T style={{ fontWeight: "600", fontSize: 13 }}>{title}</T>
        {sub && <T style={[s.micro, { marginTop: 5 }]}>{sub}</T>}
      </View>
      {end || <I name="chevron-forward" size={16} color="#B4A8C2" />}
    </Pressable>
  );
}
export function Page({
  children,
  onRefresh,
  refreshing = false,
}: {
  children: React.ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={s.page}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.purple}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
}
export function Loading() {
  return (
    <View style={{ padding: 45 }}>
      <ActivityIndicator color={C.purple} />
      <T style={[s.micro, { textAlign: "center", marginTop: 15 }]}>
        Yüklənir...
      </T>
    </View>
  );
}
export const s = StyleSheet.create({
  text: { color: C.ink, fontSize: 14 },
  page: { padding: 22, paddingTop: 9, paddingBottom: 38 },
  h1: { fontSize: 30, fontWeight: "800", letterSpacing: -1.2, lineHeight: 39 },
  h2: {
    fontSize: 23,
    fontWeight: "700",
    letterSpacing: -0.6,
    marginBottom: 10,
  },
  h3: { fontSize: 15, fontWeight: "700" },
  subtitle: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 21,
    marginVertical: 12,
  },
  micro: { fontSize: 11, color: C.muted, lineHeight: 17 },
  overline: {
    fontSize: 10,
    letterSpacing: 1.6,
    fontWeight: "700",
    color: "#A191B1",
  },
  link: { fontSize: 12, fontWeight: "700", color: C.purple },
  row: { flexDirection: "row", alignItems: "center", gap: 11 },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  card: {
    padding: 17,
    borderRadius: 19,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: C.line,
    marginBottom: 12,
  },
  button: {
    backgroundColor: C.purple,
    padding: 16,
    borderRadius: 14,
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginVertical: 5,
  },
  secondary: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#DED2EB",
  },
  buttonText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  input: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E5DDEC",
    borderRadius: 12,
    color: C.ink,
    fontSize: 14,
    minHeight: 48,
  },
  label: { fontSize: 12, fontWeight: "600", color: "#857391", marginBottom: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 13 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: "#E6DEEF",
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  chipActive: { backgroundColor: C.soft, borderColor: "#CDB7E6" },
  tag: {
    alignSelf: "flex-start",
    backgroundColor: C.soft,
    borderRadius: 7,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: C.soft,
    padding: 14,
    borderRadius: 13,
    marginVertical: 15,
  },
  empty: { paddingVertical: 40, alignItems: "center", gap: 10 },
  emptyIcon: {
    width: 86,
    height: 86,
    backgroundColor: C.soft,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  listIcon: {
    width: 38,
    height: 38,
    backgroundColor: C.soft,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  thumb: {
    width: 48,
    height: 55,
    backgroundColor: C.soft,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1, backgroundColor: C.line, marginVertical: 15 },
  price: { fontSize: 29, fontWeight: "800", letterSpacing: -0.9 },
  banner: {
    backgroundColor: C.purple,
    padding: 22,
    borderRadius: 22,
    marginVertical: 14,
  },
  summary: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 18,
    marginVertical: 12,
  },
  summaryItem: { width: "50%", gap: 6 },
  stats: { flexDirection: "row", gap: 9, marginVertical: 17 },
  stat: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 15,
    padding: 13,
  },
  statNum: {
    fontSize: 25,
    fontWeight: "800",
    color: C.purple,
    marginBottom: 6,
  },
});
