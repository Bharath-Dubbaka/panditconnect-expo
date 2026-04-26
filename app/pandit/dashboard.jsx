// app/pandit/dashboard.jsx
import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch, RefreshControl, Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, updateUser } from "../../store/slices/authSlice";
import { panditDashAPI } from "../../services/api";
import { COLORS, FONTS, RADIUS, STATUS_CONFIG } from "../../constants/theme";
import { rf, rs, rp } from "../../constants/responsive";
import { Card, SectionHeader, LoadingScreen } from "../../components/UI";
import BookingCard from "../../components/BookingCard";

export default function PanditDashboardScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toggling, setToggling] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await panditDashAPI.getDashboard();
      setDashboard(res.data.dashboard);
    } catch (err) {
      console.error("[PANDIT DASHBOARD]", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleToggleAvailability = async (value) => {
    setToggling(true);
    try {
      await panditDashAPI.toggleAvailability({ isAvailableNow: value });
      dispatch(updateUser({ isAvailableNow: value }));
      setDashboard((prev) => ({ ...prev, isAvailableNow: value }));
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || err.message);
    } finally {
      setToggling(false);
    }
  };

  if (loading) return <LoadingScreen label="Loading dashboard..." />;

  const isAvailable = dashboard?.isAvailableNow ?? user?.isAvailableNow;
  const verificationStatus = dashboard?.verificationStatus || user?.verificationStatus;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={COLORS.ochre} />}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: rp(20), paddingTop: rs(56), paddingBottom: rp(16), backgroundColor: COLORS.bgCard, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
        <Text style={{ fontFamily: FONTS.headingBold, fontSize: rf(20), color: COLORS.ochre, letterSpacing: 2 }}>🪔 PANDITCONNECT</Text>
        <Text style={{ fontFamily: FONTS.body, fontSize: rf(13), color: COLORS.textSecondary, marginTop: rp(2) }}>
          Namaste, {user?.name?.split(" ")[0]} Ji 🙏
        </Text>
      </View>

      <View style={{ padding: rp(20) }}>

        {/* Verification pending banner */}
        {verificationStatus !== "verified" && (
          <View style={{ backgroundColor: COLORS.warningBg, borderRadius: RADIUS.lg, padding: rp(16), marginBottom: rp(16), borderWidth: 1, borderColor: COLORS.warning + "30" }}>
            <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(14), color: COLORS.warning, marginBottom: rp(4) }}>
              ⏳ {verificationStatus === "under_review" ? "Profile Under Review" : "Profile Pending Verification"}
            </Text>
            <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textSecondary, lineHeight: rf(18) }}>
              {verificationStatus === "under_review"
                ? "Our team is reviewing your credentials. You'll be notified within 24-48 hours."
                : "Please complete your profile to start receiving bookings."}
            </Text>
          </View>
        )}

        {/* Availability toggle */}
        {verificationStatus === "verified" && (
          <Card style={{ marginBottom: rp(16), flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(15), color: COLORS.textPrimary, marginBottom: rp(2) }}>
                {isAvailable ? "🟢 You're Online" : "🔴 You're Offline"}
              </Text>
              <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textSecondary }}>
                {isAvailable ? "Devotees can book you right now" : "Toggle on to receive new bookings"}
              </Text>
            </View>
            <Switch
              value={!!isAvailable}
              onValueChange={handleToggleAvailability}
              disabled={toggling}
              trackColor={{ false: COLORS.border, true: COLORS.success }}
              thumbColor="#fff"
            />
          </Card>
        )}

        {/* Stats row */}
        <View style={{ flexDirection: "row", gap: rs(10), marginBottom: rp(16) }}>
          {[
            { label: "Completed", value: dashboard?.completedBookings || 0, emoji: "✅" },
            { label: "Rating", value: dashboard?.averageRating?.toFixed(1) || "New", emoji: "⭐" },
            { label: "Reviews", value: dashboard?.totalReviews || 0, emoji: "💬" },
          ].map((stat, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: rp(14), alignItems: "center", borderWidth: 1, borderColor: COLORS.border }}>
              <Text style={{ fontSize: rf(20), marginBottom: rp(4) }}>{stat.emoji}</Text>
              <Text style={{ fontFamily: FONTS.headingBold, fontSize: rf(18), color: COLORS.ochre }}>{stat.value}</Text>
              <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, marginTop: rp(2) }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Pending requests */}
        {dashboard?.pendingRequestsCount > 0 && (
          <TouchableOpacity
            style={{ backgroundColor: COLORS.saffronPale, borderRadius: RADIUS.lg, padding: rp(16), marginBottom: rp(16), borderWidth: 1.5, borderColor: COLORS.saffron + "60", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
            onPress={() => router.push("/pandit/requests")}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: rs(12) }}>
              <Text style={{ fontSize: rf(24) }}>🔔</Text>
              <View>
                <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(15), color: COLORS.saffron }}>
                  {dashboard.pendingRequestsCount} New Request{dashboard.pendingRequestsCount > 1 ? "s" : ""}
                </Text>
                <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textSecondary }}>
                  Tap to view and accept
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: rf(20), color: COLORS.saffron }}>›</Text>
          </TouchableOpacity>
        )}

        {/* Today's bookings */}
        {dashboard?.todayBookings?.length > 0 && (
          <>
            <SectionHeader label="TODAY'S SCHEDULE" style={{ marginBottom: rp(10) }} />
            {dashboard.todayBookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                viewAs="pandit"
                onPress={(b) => router.push(`/pandit/bookings`)}
              />
            ))}
          </>
        )}

        {/* Upcoming */}
        {dashboard?.upcomingBookings?.length > 0 && (
          <>
            <SectionHeader label="UPCOMING" style={{ marginTop: rp(8), marginBottom: rp(10) }} />
            {dashboard.upcomingBookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                viewAs="pandit"
                onPress={() => router.push("/pandit/bookings")}
              />
            ))}
          </>
        )}

        {!dashboard?.todayBookings?.length && !dashboard?.upcomingBookings?.length && verificationStatus === "verified" && (
          <View style={{ alignItems: "center", paddingVertical: rp(32) }}>
            <Text style={{ fontSize: rf(44), marginBottom: rp(12) }}>🪔</Text>
            <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(15), color: COLORS.textSecondary, textAlign: "center" }}>
              No upcoming bookings.{"\n"}Stay online to receive new requests!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
