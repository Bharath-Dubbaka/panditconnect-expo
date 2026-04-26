// app/pandit/bookings.jsx
import { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { useFocusEffect } from "expo-router";
import { bookingAPI } from "../../services/api";
import { COLORS, FONTS, RADIUS, STATUS_CONFIG } from "../../constants/theme";
import { rf, rs, rp } from "../../constants/responsive";
import { ScreenHeader, Card, Button, EmptyState, LoadingScreen } from "../../components/UI";

const STATUS_TABS = [
  { key: "accepted", label: "Confirmed" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

function BookingManageCard({ booking, onStart, onComplete, actionId }) {
  const sc = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending_pandit;
  const user = booking.userId;
  const poojaName = booking.poojaName || booking.poojaTypeId?.name;
  const isActioning = actionId === booking._id;

  return (
    <Card style={{ marginBottom: rp(12) }}>
      {/* Status + pooja */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: rp(12) }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: rs(10) }}>
          <Text style={{ fontSize: rf(22) }}>{booking.poojaTypeId?.iconEmoji || "🪔"}</Text>
          <View>
            <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(14), color: COLORS.textPrimary }}>{poojaName}</Text>
            <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textSecondary }}>for {user?.name || "Devotee"}</Text>
          </View>
        </View>
        <View style={{ backgroundColor: sc.bg, borderRadius: RADIUS.full, paddingHorizontal: rp(10), paddingVertical: rp(4) }}>
          <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(11), color: sc.color }}>{sc.emoji} {sc.label}</Text>
        </View>
      </View>

      {/* Details */}
      <View style={{ backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.md, padding: rp(10), marginBottom: rp(12), flexDirection: "row", justifyContent: "space-between" }}>
        <View>
          <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim }}>DATE & TIME</Text>
          <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(13), color: COLORS.textPrimary }}>
            {booking.scheduledDate} · {booking.scheduledTime}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim }}>ADDRESS</Text>
          <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(13), color: COLORS.textPrimary }}>
            {booking.address?.city}
          </Text>
        </View>
      </View>

      {/* Phone after acceptance */}
      {user?.phone && (
        <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textSecondary, marginBottom: rp(12) }}>
          📞 Devotee: {user.phone}
        </Text>
      )}

      {/* Action buttons */}
      {booking.status === "accepted" && (
        <Button
          label="🪔 Mark as Started"
          onPress={() => onStart(booking._id)}
          loading={isActioning}
        />
      )}
      {booking.status === "in_progress" && (
        <Button
          label="✓ Mark as Completed"
          onPress={() => onComplete(booking._id)}
          loading={isActioning}
        />
      )}
      {booking.status === "completed" && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: rs(8), backgroundColor: COLORS.successBg, borderRadius: RADIUS.md, padding: rp(10) }}>
          <Text style={{ fontSize: rf(16) }}>✅</Text>
          <View>
            <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(13), color: COLORS.success }}>
              Completed · ₹{booking.payoutAmount} pending payout
            </Text>
          </View>
        </View>
      )}
    </Card>
  );
}

export default function PanditBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("accepted");
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await bookingAPI.getPanditAll({ status: activeTab });
      setBookings(res.data.bookings || []);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, [activeTab]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleStart = async (bookingId) => {
    setActionId(bookingId);
    try {
      await bookingAPI.start(bookingId);
      load(true);
      Alert.alert("Started! 🪔", "Booking marked as in progress. The devotee has been notified.");
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || err.message);
    } finally { setActionId(null); }
  };

  const handleComplete = (bookingId) => {
    Alert.alert("Mark as Completed?", "Confirm that the pooja has been successfully performed.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes, Completed",
        onPress: async () => {
          setActionId(bookingId);
          try {
            await bookingAPI.complete(bookingId);
            load(true);
            Alert.alert("🙏 Completed!", "Booking marked as complete. Payment will be processed shortly.");
          } catch (err) {
            Alert.alert("Error", err?.response?.data?.message || err.message);
          } finally { setActionId(null); }
        },
      },
    ]);
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScreenHeader title="MY BOOKINGS" />

      {/* Status tabs */}
      <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
        {STATUS_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={{ flex: 1, paddingVertical: rp(12), alignItems: "center", borderBottomWidth: 2, borderBottomColor: activeTab === tab.key ? COLORS.ochre : "transparent" }}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(12), color: activeTab === tab.key ? COLORS.ochre : COLORS.textSecondary }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(b) => b._id}
        renderItem={({ item }) => (
          <BookingManageCard
            booking={item}
            onStart={handleStart}
            onComplete={handleComplete}
            actionId={actionId}
          />
        )}
        contentContainerStyle={{ padding: rp(20), paddingBottom: rp(32), ...(bookings.length === 0 && { flex: 1, justifyContent: "center" }) }}
        ListEmptyComponent={<EmptyState emoji="📅" title={`No ${activeTab.replace("_", " ")} bookings`} body="Check the Requests tab for new incoming requests" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={COLORS.ochre} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
