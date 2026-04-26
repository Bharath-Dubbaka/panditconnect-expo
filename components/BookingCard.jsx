// components/BookingCard.jsx
import { View, Text, TouchableOpacity, Image } from "react-native";
import { COLORS, FONTS, RADIUS, STATUS_CONFIG } from "../constants/theme";
import { rf, rs, rp } from "../constants/responsive";

export default function BookingCard({ booking, onPress, viewAs = "user" }) {
  const sc = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending_pandit;
  const other = viewAs === "user" ? booking.panditId : booking.userId;
  const photo = other?.photos?.[0] || other?.avatar;
  const poojaName = booking.poojaName || booking.poojaTypeId?.name || "Pooja";
  const icon = booking.poojaTypeId?.iconEmoji || "🪔";

  return (
    <TouchableOpacity
      style={{
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: rp(14),
        marginBottom: rp(12),
        flexDirection: "row",
        alignItems: "center",
        gap: rs(12),
      }}
      onPress={() => onPress?.(booking)}
      activeOpacity={0.85}
    >
      {/* Avatar */}
      <View
        style={{
          width: rs(52),
          height: rs(52),
          borderRadius: rs(26),
          backgroundColor: COLORS.bgOchre,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1.5,
          borderColor: sc.color + "40",
          flexShrink: 0,
        }}
      >
        {photo ? (
          <Image source={{ uri: photo }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        ) : (
          <Text style={{ fontSize: rf(22) }}>{icon}</Text>
        )}
      </View>

      {/* Details */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(14), color: COLORS.textPrimary, marginBottom: rp(2) }} numberOfLines={1}>
          {poojaName}
        </Text>
        <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textSecondary, marginBottom: rp(4) }} numberOfLines={1}>
          {viewAs === "user" ? `with ${other?.name || "Pandit"}` : `for ${other?.name || "User"}`}
        </Text>
        <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim }}>
          📅 {booking.scheduledDate} · 🕐 {booking.scheduledTime}
        </Text>
      </View>

      {/* Status + amount */}
      <View style={{ alignItems: "flex-end", gap: rs(6) }}>
        <View
          style={{
            backgroundColor: sc.bg,
            borderRadius: RADIUS.full,
            paddingHorizontal: rp(8),
            paddingVertical: rp(3),
          }}
        >
          <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(10), color: sc.color }}>
            {sc.emoji} {sc.label}
          </Text>
        </View>
        <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(14), color: COLORS.ochre }}>
          ₹{booking.totalAmount?.toLocaleString("en-IN")}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
