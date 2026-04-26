// components/UI.jsx
// Shared primitive components used across all screens.
// Keeps screens clean — import what you need.

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { COLORS, FONTS, RADIUS, SHADOWS } from "../constants/theme";
import { rf, rs, rp } from "../constants/responsive";

// ── Button ────────────────────────────────────────────────
export function Button({
  label,
  onPress,
  loading,
  disabled,
  variant = "primary", // "primary" | "outline" | "ghost" | "danger"
  size = "md",         // "sm" | "md" | "lg"
  style,
  labelStyle,
}) {
  const heights = { sm: rs(38), md: rs(50), lg: rs(56) };
  const fontSizes = { sm: rf(13), md: rf(15), lg: rf(17) };

  const bgMap = {
    primary: COLORS.ochre,
    outline: "transparent",
    ghost: "transparent",
    danger: COLORS.error,
  };
  const borderMap = {
    primary: COLORS.ochre,
    outline: COLORS.ochre,
    ghost: "transparent",
    danger: COLORS.error,
  };
  const textMap = {
    primary: "#FFFFFF",
    outline: COLORS.ochre,
    ghost: COLORS.ochre,
    danger: "#FFFFFF",
  };

  return (
    <TouchableOpacity
      style={[
        {
          height: heights[size],
          borderRadius: RADIUS.lg,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: bgMap[variant],
          borderWidth: variant === "outline" ? 1.5 : 0,
          borderColor: borderMap[variant],
          opacity: disabled || loading ? 0.55 : 1,
          ...(variant === "primary" ? SHADOWS.ochre : {}),
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
    >
      {loading ? (
        <ActivityIndicator color={textMap[variant]} size="small" />
      ) : (
        <Text
          style={[
            {
              fontFamily: FONTS.bodyBold,
              fontSize: fontSizes[size],
              color: textMap[variant],
              letterSpacing: 0.3,
            },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ── Card ──────────────────────────────────────────────────
export function Card({ children, style }) {
  return (
    <View
      style={[
        {
          backgroundColor: COLORS.bgCard,
          borderRadius: RADIUS.lg,
          borderWidth: 1,
          borderColor: COLORS.border,
          padding: rp(16),
          ...SHADOWS.sm,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ── Section header ────────────────────────────────────────
export function SectionHeader({ label, right, style }) {
  return (
    <View
      style={[
        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: rp(12) },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: FONTS.bodyBold,
          fontSize: rf(11),
          color: COLORS.textDim,
          letterSpacing: 2.5,
        }}
      >
        {label}
      </Text>
      {right}
    </View>
  );
}

// ── Star rating display ───────────────────────────────────
export function StarRating({ rating = 0, size = 14, showNumber = true }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: rs(2) }}>
      {stars.map((s) => (
        <Text key={s} style={{ fontSize: rf(size), color: s <= Math.round(rating) ? COLORS.star : COLORS.starEmpty }}>
          ★
        </Text>
      ))}
      {showNumber && (
        <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(12), color: COLORS.textSecondary, marginLeft: rs(4) }}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
}

// ── Badge ─────────────────────────────────────────────────
export function Badge({ label, color = COLORS.ochre, bg, style }) {
  return (
    <View
      style={[
        {
          backgroundColor: bg || color + "18",
          borderRadius: RADIUS.full,
          paddingHorizontal: rp(10),
          paddingVertical: rp(3),
          borderWidth: 1,
          borderColor: color + "40",
          alignSelf: "flex-start",
        },
        style,
      ]}
    >
      <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(11), color }}>
        {label}
      </Text>
    </View>
  );
}

// ── Empty state ───────────────────────────────────────────
export function EmptyState({ emoji, title, body, style }) {
  return (
    <View style={[{ alignItems: "center", paddingVertical: rp(48), paddingHorizontal: rp(32) }, style]}>
      <Text style={{ fontSize: rf(48), marginBottom: rs(16) }}>{emoji}</Text>
      <Text style={{ fontFamily: FONTS.heading, fontSize: rf(18), color: COLORS.textPrimary, textAlign: "center", marginBottom: rp(8) }}>
        {title}
      </Text>
      {body && (
        <Text style={{ fontFamily: FONTS.body, fontSize: rf(14), color: COLORS.textSecondary, textAlign: "center", lineHeight: rf(22) }}>
          {body}
        </Text>
      )}
    </View>
  );
}

// ── Loading screen ────────────────────────────────────────
export function LoadingScreen({ label = "Loading..." }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.bg }}>
      <ActivityIndicator color={COLORS.ochre} size="large" />
      <Text style={{ fontFamily: FONTS.body, fontSize: rf(14), color: COLORS.textSecondary, marginTop: rs(16) }}>
        {label}
      </Text>
    </View>
  );
}

// ── Screen header ─────────────────────────────────────────
export function ScreenHeader({ title, subtitle, right, onBack, style }) {
  return (
    <View
      style={[
        {
          paddingHorizontal: rp(20),
          paddingTop: rs(56),
          paddingBottom: rp(14),
          backgroundColor: COLORS.bgCard,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
          flexDirection: "row",
          alignItems: "center",
          gap: rs(10),
        },
        style,
      ]}
    >
      {onBack && (
        <TouchableOpacity onPress={onBack} style={{ padding: rp(4) }}>
          <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(22), color: COLORS.textPrimary }}>←</Text>
        </TouchableOpacity>
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONTS.headingBold, fontSize: rf(17), color: COLORS.ochre, letterSpacing: 2 }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textSecondary, marginTop: 1 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {right}
    </View>
  );
}

// ── Info row (label + value) ──────────────────────────────
export function InfoRow({ label, value, emoji, last }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: rp(10),
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: COLORS.borderLight,
      }}
    >
      <Text style={{ fontFamily: FONTS.body, fontSize: rf(13), color: COLORS.textSecondary }}>
        {emoji ? `${emoji}  ` : ""}{label}
      </Text>
      <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(13), color: COLORS.textPrimary, maxWidth: "55%", textAlign: "right" }}>
        {value || "—"}
      </Text>
    </View>
  );
}

// ── Divider ───────────────────────────────────────────────
export function Divider({ style }) {
  return (
    <View style={[{ height: 1, backgroundColor: COLORS.divider, marginVertical: rp(8) }, style]} />
  );
}
