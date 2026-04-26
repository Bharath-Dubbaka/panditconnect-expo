// app/user/pandit/[id].jsx
import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  ActivityIndicator, Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { panditAPI } from "../../../services/api";
import { COLORS, FONTS, RADIUS, SHADOWS, SAMPRADAYA_CONFIG, STATUS_CONFIG } from "../../../constants/theme";
import { rf, rs, rp } from "../../../constants/responsive";
import { Button, StarRating, Badge, Card, SectionHeader, InfoRow, LoadingScreen } from "../../../components/UI";

const { height: SCREEN_H } = Dimensions.get("window");

export default function PanditProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [pandit, setPandit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    panditAPI.getById(id).then((res) => {
      setPandit(res.data.pandit);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingScreen label="Loading pandit profile..." />;
  if (!pandit) return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontFamily: FONTS.body, fontSize: rf(15), color: COLORS.textSecondary }}>Pandit not found</Text>
    </View>
  );

  const sc = SAMPRADAYA_CONFIG[pandit.sampradaya] || SAMPRADAYA_CONFIG.Other;
  const photos = (pandit.photos || []).filter(Boolean);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: rp(100) }}>

        {/* Photo */}
        <View style={{ height: SCREEN_H * 0.42, backgroundColor: COLORS.bgOchre, position: "relative" }}>
          {photos.length > 0 ? (
            <>
              <Image source={{ uri: photos[photoIndex] }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
              {photos.length > 1 && (
                <>
                  {photoIndex > 0 && (
                    <TouchableOpacity style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "30%" }} onPress={() => setPhotoIndex((i) => i - 1)} activeOpacity={1} />
                  )}
                  {photoIndex < photos.length - 1 && (
                    <TouchableOpacity style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "30%" }} onPress={() => setPhotoIndex((i) => i + 1)} activeOpacity={1} />
                  )}
                  <View style={{ position: "absolute", top: rp(54), left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: rs(6) }}>
                    {photos.map((_, i) => (
                      <View key={i} style={{ width: i === photoIndex ? rs(20) : rs(6), height: rs(6), borderRadius: rs(3), backgroundColor: i === photoIndex ? "#fff" : "rgba(255,255,255,0.5)" }} />
                    ))}
                  </View>
                </>
              )}
            </>
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: rf(64) }}>🙏</Text>
            </View>
          )}

          {/* Back button */}
          <TouchableOpacity
            style={{ position: "absolute", top: rs(52), left: rp(16), backgroundColor: "rgba(255,255,255,0.85)", borderRadius: RADIUS.full, width: rs(38), height: rs(38), alignItems: "center", justifyContent: "center" }}
            onPress={() => router.back()}
          >
            <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(18), color: COLORS.textPrimary }}>←</Text>
          </TouchableOpacity>

          {/* Name overlay */}
          <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: rp(16), paddingTop: rp(40), background: "linear-gradient(transparent, rgba(0,0,0,0.6))" }}>
            <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONTS.headingBold, fontSize: rf(24), color: "#fff", marginBottom: rp(4) }}>
                  {pandit.name}
                </Text>
                <Text style={{ fontFamily: FONTS.body, fontSize: rf(13), color: "rgba(255,255,255,0.85)" }}>
                  {pandit.city}, {pandit.state}
                </Text>
              </View>
              <View style={{ backgroundColor: "rgba(255,255,255,0.9)", borderRadius: RADIUS.full, paddingHorizontal: rp(12), paddingVertical: rp(5), flexDirection: "row", alignItems: "center", gap: rs(5) }}>
                <Text style={{ fontSize: rf(14) }}>{sc.emoji}</Text>
                <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(12), color: sc.color }}>{pandit.sampradaya}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: "row", backgroundColor: COLORS.bgCard, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
          {[
            { label: "Rating", value: pandit.averageRating?.toFixed(1) || "New", emoji: "⭐" },
            { label: "Reviews", value: pandit.totalReviews || 0, emoji: "💬" },
            { label: "Bookings", value: pandit.completedBookings || 0, emoji: "📅" },
            { label: "Exp", value: `${pandit.yearsExperience || 0}yr`, emoji: "🕐" },
          ].map((stat, i) => (
            <View key={i} style={{ flex: 1, alignItems: "center", paddingVertical: rp(14), borderRightWidth: i < 3 ? 1 : 0, borderRightColor: COLORS.border }}>
              <Text style={{ fontSize: rf(16), marginBottom: rp(2) }}>{stat.emoji}</Text>
              <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(15), color: COLORS.ochre }}>{stat.value}</Text>
              <Text style={{ fontFamily: FONTS.body, fontSize: rf(10), color: COLORS.textDim }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Available badge */}
        {pandit.isAvailableNow && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: rs(8), margin: rp(16), backgroundColor: COLORS.successBg, borderRadius: RADIUS.md, padding: rp(12), borderWidth: 1, borderColor: COLORS.success + "40" }}>
            <View style={{ width: rs(8), height: rs(8), borderRadius: rs(4), backgroundColor: COLORS.success }} />
            <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(13), color: COLORS.success }}>
              Available for bookings today
            </Text>
          </View>
        )}

        {/* Tabs */}
        <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.border, marginTop: pandit.isAvailableNow ? 0 : rp(8) }}>
          {["about", "services", "reviews"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={{ flex: 1, paddingVertical: rp(12), alignItems: "center", borderBottomWidth: 2, borderBottomColor: activeTab === tab ? COLORS.ochre : "transparent" }}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(13), color: activeTab === tab ? COLORS.ochre : COLORS.textSecondary }}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ paddingHorizontal: rp(20), paddingTop: rp(18) }}>
          {/* About tab */}
          {activeTab === "about" && (
            <>
              {pandit.bio && (
                <Card style={{ marginBottom: rp(16) }}>
                  <Text style={{ fontFamily: FONTS.body, fontSize: rf(14), color: COLORS.textSecondary, lineHeight: rf(22) }}>
                    {pandit.bio}
                  </Text>
                </Card>
              )}
              <Card style={{ marginBottom: rp(16) }}>
                <SectionHeader label="CREDENTIALS" />
                <InfoRow emoji="🕉️" label="Sampradaya" value={pandit.sampradaya} />
                <InfoRow emoji="📖" label="Veda" value={pandit.veda} />
                <InfoRow emoji="🧬" label="Gotram" value={pandit.gotram} />
                <InfoRow emoji="🏛️" label="Gurukul" value={pandit.gurukul} />
                <InfoRow emoji="⏳" label="Experience" value={`${pandit.yearsExperience} years`} last />
              </Card>
              <Card style={{ marginBottom: rp(16) }}>
                <SectionHeader label="LANGUAGES" />
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: rs(8) }}>
                  {pandit.languages?.map((l) => <Badge key={l} label={l} color={COLORS.ochreDim} />)}
                </View>
              </Card>
              <Card>
                <InfoRow emoji="📍" label="Serves" value={`${pandit.city}, ${pandit.state}`} />
                <InfoRow emoji="🚗" label="Travel radius" value={`${pandit.travelRadiusKm} km`} last />
              </Card>
            </>
          )}

          {/* Services tab */}
          {activeTab === "services" && (
            <View style={{ gap: rs(10) }}>
              {pandit.pricingList?.map((item, i) => (
                <Card key={i}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: rs(12) }}>
                    <Text style={{ fontSize: rf(24) }}>{item.poojaTypeId?.iconEmoji || "🪔"}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(14), color: COLORS.textPrimary, marginBottom: rp(2) }}>
                        {item.poojaTypeId?.name || "Pooja"}
                      </Text>
                      <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textDim }}>
                        ⏱ {item.durationMinutes} min
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ fontFamily: FONTS.headingBold, fontSize: rf(18), color: COLORS.ochre }}>₹{item.basePrice}</Text>
                      <TouchableOpacity
                        style={{ marginTop: rp(6), backgroundColor: COLORS.ochrePale, borderRadius: RADIUS.md, paddingHorizontal: rp(12), paddingVertical: rp(5), borderWidth: 1, borderColor: COLORS.ochre + "40" }}
                        onPress={() => router.push({ pathname: `/user/book/${pandit._id}`, params: { poojaTypeId: item.poojaTypeId?._id, poojaName: item.poojaTypeId?.name } })}
                      >
                        <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(12), color: COLORS.ochre }}>Book</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {item.note && (
                    <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, marginTop: rp(8), fontStyle: "italic" }}>
                      * {item.note}
                    </Text>
                  )}
                </Card>
              ))}
            </View>
          )}

          {/* Reviews tab */}
          {activeTab === "reviews" && (
            pandit.reviews?.length > 0 ? (
              <View style={{ gap: rs(12) }}>
                {pandit.reviews.map((review, i) => (
                  <Card key={i}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: rp(8) }}>
                      <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(13), color: COLORS.textPrimary }}>
                        {review.userId?.name || "Devotee"}
                      </Text>
                      <StarRating rating={review.rating} size={12} showNumber={false} />
                    </View>
                    {review.comment && (
                      <Text style={{ fontFamily: FONTS.body, fontSize: rf(13), color: COLORS.textSecondary, lineHeight: rf(20) }}>
                        {review.comment}
                      </Text>
                    )}
                    <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, marginTop: rp(6) }}>
                      {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </Text>
                  </Card>
                ))}
              </View>
            ) : (
              <View style={{ alignItems: "center", paddingVertical: rp(40) }}>
                <Text style={{ fontSize: rf(36), marginBottom: rs(12) }}>⭐</Text>
                <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(15), color: COLORS.textSecondary }}>No reviews yet</Text>
              </View>
            )
          )}
        </View>
      </ScrollView>

      {/* Fixed Book button */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: rp(16), paddingBottom: rp(32), backgroundColor: COLORS.bgCard, borderTopWidth: 1, borderTopColor: COLORS.border, flexDirection: "row", gap: rs(12) }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim }}>Starting from</Text>
          <Text style={{ fontFamily: FONTS.headingBold, fontSize: rf(20), color: COLORS.ochre }}>
            ₹{pandit.pricingList?.[0]?.basePrice || "—"}
          </Text>
        </View>
        <Button
          label="Book Pandit 🪔"
          style={{ flex: 1 }}
          onPress={() => router.push({ pathname: `/user/book/${pandit._id}`, params: { poojaTypeId: pandit.pricingList?.[0]?.poojaTypeId?._id } })}
        />
      </View>
    </View>
  );
}
