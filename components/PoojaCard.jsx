// components/PoojaCard.jsx
import { View, Text, TouchableOpacity, Image } from "react-native";
import { COLORS, FONTS, RADIUS, SHADOWS } from "../constants/theme";
import { rf, rs, rp } from "../constants/responsive";

export default function PoojaCard({ pooja, onPress, style, compact = false }) {
  if (compact) {
    // Small grid card for home screen
    return (
      <TouchableOpacity
        style={[
          {
            backgroundColor: COLORS.bgCard,
            borderRadius: RADIUS.lg,
            padding: rp(14),
            alignItems: "center",
            borderWidth: 1,
            borderColor: COLORS.border,
            gap: rs(8),
            ...SHADOWS.sm,
          },
          style,
        ]}
        onPress={() => onPress?.(pooja)}
        activeOpacity={0.85}
      >
        <Text style={{ fontSize: rf(32) }}>{pooja.iconEmoji || "🪔"}</Text>
        <Text
          style={{
            fontFamily: FONTS.bodyMedium,
            fontSize: rf(12),
            color: COLORS.textPrimary,
            textAlign: "center",
            lineHeight: rf(17),
          }}
          numberOfLines={2}
        >
          {pooja.name}
        </Text>
        {pooja.estimatedSamagriPrice > 0 && (
          <Text style={{ fontFamily: FONTS.body, fontSize: rf(10), color: COLORS.textDim }}>
            Samagri ~₹{pooja.estimatedSamagriPrice}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  // Full card — used in browse list
  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: COLORS.bgCard,
          borderRadius: RADIUS.lg,
          borderWidth: 1,
          borderColor: COLORS.border,
          padding: rp(16),
          flexDirection: "row",
          alignItems: "center",
          gap: rs(14),
          ...SHADOWS.sm,
        },
        style,
      ]}
      onPress={() => onPress?.(pooja)}
      activeOpacity={0.85}
    >
      {/* Icon */}
      <View
        style={{
          width: rs(56),
          height: rs(56),
          borderRadius: RADIUS.md,
          backgroundColor: COLORS.bgOchre,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: COLORS.ochreDim + "40",
          flexShrink: 0,
        }}
      >
        {pooja.imageUrl ? (
          <Image source={{ uri: pooja.imageUrl }} style={{ width: "100%", height: "100%", borderRadius: RADIUS.md }} resizeMode="cover" />
        ) : (
          <Text style={{ fontSize: rf(28) }}>{pooja.iconEmoji || "🪔"}</Text>
        )}
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(14), color: COLORS.textPrimary, marginBottom: rp(2) }}>
          {pooja.name}
        </Text>
        {pooja.shortDescription && (
          <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textSecondary, lineHeight: rf(17), marginBottom: rp(4) }} numberOfLines={2}>
            {pooja.shortDescription}
          </Text>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: rs(10) }}>
          <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim }}>
            ⏱ {pooja.minDurationMinutes}–{pooja.maxDurationMinutes} min
          </Text>
          {pooja.deity && (
            <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim }}>
              · {pooja.deity}
            </Text>
          )}
        </View>
      </View>

      <Text style={{ fontSize: rf(16), color: COLORS.textDim }}>›</Text>
    </TouchableOpacity>
  );
}
