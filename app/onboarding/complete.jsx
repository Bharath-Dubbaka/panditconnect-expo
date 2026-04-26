// app/onboarding/complete.jsx
import { useState } from "react";
import { View, Text, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { updateUser } from "../../store/slices/authSlice";
import { onboardingAPI } from "../../services/api";
import { COLORS, FONTS, RADIUS } from "../../constants/theme";
import { rf, rs, rp } from "../../constants/responsive";
import { Button, Card } from "../../components/UI";

const CHECKLIST = [
  { emoji: "📿", label: "Sampradaya & Credentials", done: true },
  { emoji: "🪔", label: "Services & Pricing", done: true },
  { emoji: "🗓", label: "Availability Schedule", done: true },
  { emoji: "🔍", label: "Admin Verification", done: false, pending: true },
];

export default function CompleteScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onboardingAPI.complete();
      await dispatch(updateUser({ onboardingComplete: true, verificationStatus: "under_review" }));
      setSubmitted(true);
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center", padding: rp(32) }}>
        <Text style={{ fontSize: rf(64), marginBottom: rp(20) }}>🙏</Text>
        <Text style={{ fontFamily: FONTS.headingBold, fontSize: rf(24), color: COLORS.ochre, letterSpacing: 1, textAlign: "center", marginBottom: rp(12) }}>
          Profile Submitted!
        </Text>
        <Text style={{ fontFamily: FONTS.body, fontSize: rf(15), color: COLORS.textSecondary, textAlign: "center", lineHeight: rf(24), marginBottom: rp(32) }}>
          Our team will review your credentials within 24-48 hours. You'll receive a notification once verified.
        </Text>
        <Card style={{ width: "100%", marginBottom: rp(28) }}>
          {["Your profile is under review", "You'll be notified via push notification", "Once approved, bookings will start coming in"].map((item, i) => (
            <View key={i} style={{ flexDirection: "row", gap: rs(10), marginBottom: i < 2 ? rp(10) : 0 }}>
              <Text style={{ fontSize: rf(14) }}>⏳</Text>
              <Text style={{ fontFamily: FONTS.body, fontSize: rf(13), color: COLORS.textSecondary, flex: 1, lineHeight: rf(19) }}>{item}</Text>
            </View>
          ))}
        </Card>
        <Text style={{ fontFamily: FONTS.body, fontSize: rf(13), color: COLORS.textDim, textAlign: "center" }}>
          You can explore your dashboard while waiting.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={{ paddingHorizontal: rp(20), paddingTop: rs(60), paddingBottom: rp(20) }}>
        <Text style={{ fontFamily: FONTS.headingBold, fontSize: rf(22), color: COLORS.ochre, letterSpacing: 2 }}>
          ALMOST THERE!
        </Text>
        <Text style={{ fontFamily: FONTS.body, fontSize: rf(14), color: COLORS.textSecondary, marginTop: rp(4) }}>
          Review your profile and submit for verification
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: rp(20), paddingBottom: rp(120) }} showsVerticalScrollIndicator={false}>
        {/* Checklist */}
        <Card style={{ marginBottom: rp(20) }}>
          <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, letterSpacing: 2, marginBottom: rp(14) }}>
            PROFILE CHECKLIST
          </Text>
          {CHECKLIST.map((item, i) => (
            <View key={i} style={{
              flexDirection: "row", alignItems: "center", gap: rs(12),
              paddingVertical: rp(10),
              borderBottomWidth: i < CHECKLIST.length - 1 ? 1 : 0,
              borderBottomColor: COLORS.borderLight,
            }}>
              <Text style={{ fontSize: rf(20) }}>{item.emoji}</Text>
              <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(14), color: COLORS.textPrimary, flex: 1 }}>
                {item.label}
              </Text>
              {item.pending ? (
                <View style={{ backgroundColor: COLORS.warningBg, borderRadius: RADIUS.full, paddingHorizontal: rp(8), paddingVertical: rp(3) }}>
                  <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(10), color: COLORS.warning }}>Pending</Text>
                </View>
              ) : (
                <Text style={{ fontSize: rf(18), color: COLORS.success }}>✓</Text>
              )}
            </View>
          ))}
        </Card>

        {/* What happens next */}
        <Card style={{ marginBottom: rp(20) }}>
          <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, letterSpacing: 2, marginBottom: rp(14) }}>
            WHAT HAPPENS NEXT
          </Text>
          {[
            { step: "1", text: "Our team reviews your sampradaya credentials and experience" },
            { step: "2", text: "We may contact you for a brief video call verification" },
            { step: "3", text: "Once approved, your profile goes live and you start receiving bookings" },
            { step: "4", text: "You earn 90% of each booking fee — we keep 10% as platform fee" },
          ].map((item) => (
            <View key={item.step} style={{ flexDirection: "row", gap: rs(12), marginBottom: rp(12) }}>
              <View style={{
                width: rs(24), height: rs(24), borderRadius: rs(12),
                backgroundColor: COLORS.ochrePale, alignItems: "center", justifyContent: "center",
                borderWidth: 1, borderColor: COLORS.ochre + "40", flexShrink: 0,
              }}>
                <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(12), color: COLORS.ochre }}>{item.step}</Text>
              </View>
              <Text style={{ fontFamily: FONTS.body, fontSize: rf(13), color: COLORS.textSecondary, flex: 1, lineHeight: rf(19) }}>
                {item.text}
              </Text>
            </View>
          ))}
        </Card>
      </ScrollView>

      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: rp(20), paddingBottom: rp(36), backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border }}>
        <Button label="Submit Profile for Review 🙏" onPress={handleSubmit} loading={loading} />
      </View>
    </View>
  );
}
