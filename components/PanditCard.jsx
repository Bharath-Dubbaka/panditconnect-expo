// components/PanditCard.jsx
import { View, Text, Image, TouchableOpacity } from "react-native";
import { COLORS, FONTS, RADIUS, SHADOWS, SAMPRADAYA_CONFIG } from "../constants/theme";
import { rf, rs, rp } from "../constants/responsive";
import { StarRating, Badge } from "./UI";

export default function PanditCard({ pandit, onPress, poojaPrice, style }) {
  const sc = SAMPRADAYA_CONFIG[pandit.sampradaya] || SAMPRADAYA_CONFIG.Other;
  const photo = pandit.photos?.[0];

  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: COLORS.bgCard,
          borderRadius: RADIUS.lg,
          borderWidth: 1,
          borderColor: COLORS.border,
          overflow: "hidden",
          ...SHADOWS.sm,
        },
        style,
      ]}
      onPress={() => onPress?.(pandit)}
      activeOpacity={0.85}
    >
      {/* Photo strip */}
      <View style={{ height: rs(140), backgroundColor: COLORS.bgOchre }}>
        {photo ? (
          <Image source={{ uri: photo }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: rf(44) }}>🙏</Text>
          </View>
        )}
        {/* Sampradaya badge */}
        <View
          style={{
            position: "absolute",
            top: rp(10),
            left: rp(10),
            backgroundColor: "rgba(255,255,255,0.92)",
            borderRadius: RADIUS.full,
            paddingHorizontal: rp(10),
            paddingVertical: rp(3),
            flexDirection: "row",
            alignItems: "center",
            gap: rs(4),
          }}
        >
          <Text style={{ fontSize: rf(12) }}>{sc.emoji}</Text>
          <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(11), color: sc.color }}>
            {pandit.sampradaya}
          </Text>
        </View>
        {/* Available now dot */}
        {pandit.isAvailableNow && (
          <View
            style={{
              position: "absolute",
              top: rp(10),
              right: rp(10),
              backgroundColor: COLORS.success,
              borderRadius: RADIUS.full,
              paddingHorizontal: rp(8),
              paddingVertical: rp(3),
              flexDirection: "row",
              alignItems: "center",
              gap: rs(4),
            }}
          >
            <View style={{ width: rs(6), height: rs(6), borderRadius: rs(3), backgroundColor: "#fff" }} />
            <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(10), color: "#fff" }}>Available</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={{ padding: rp(14) }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: rp(6) }}>
          <View style={{ flex: 1, marginRight: rs(8) }}>
            <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(15), color: COLORS.textPrimary }} numberOfLines={1}>
              {pandit.name}
            </Text>
            <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textSecondary, marginTop: 1 }}>
              {pandit.city} · {pandit.yearsExperience}+ yrs exp
            </Text>
          </View>
          {poojaPrice && (
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(15), color: COLORS.ochre }}>
                ₹{poojaPrice}
              </Text>
              <Text style={{ fontFamily: FONTS.body, fontSize: rf(10), color: COLORS.textDim }}>onwards</Text>
            </View>
          )}
        </View>

        {/* Rating */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <StarRating rating={pandit.averageRating || 0} size={13} />
          <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim }}>
            ({pandit.totalReviews || 0} reviews)
          </Text>
        </View>

        {/* Languages */}
        {pandit.languages?.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: rs(6), marginTop: rp(8) }}>
            {pandit.languages.slice(0, 3).map((lang) => (
              <Badge key={lang} label={lang} color={COLORS.ochreDim} />
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
