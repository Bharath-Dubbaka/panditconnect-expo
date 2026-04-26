// app/pandit/requests.jsx
import { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl, Modal, TextInput } from "react-native";
import { useFocusEffect } from "expo-router";
import { bookingAPI } from "../../services/api";
import { COLORS, FONTS, RADIUS } from "../../constants/theme";
import { rf, rs, rp } from "../../constants/responsive";
import { ScreenHeader, Card, Button, EmptyState, LoadingScreen } from "../../components/UI";

function RequestCard({ booking, onAccept, onDecline, accepting, declining }) {
  const poojaName = booking.poojaName || booking.poojaTypeId?.name;
  const user = booking.userId;
  const icon = booking.poojaTypeId?.iconEmoji || "🪔";
  const deadline = booking.acceptDeadline
    ? new Date(booking.acceptDeadline).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <Card style={{ marginBottom: rp(14) }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: rs(12), marginBottom: rp(14) }}>
        <Text style={{ fontSize: rf(32) }}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(15), color: COLORS.textPrimary, marginBottom: rp(2) }}>
            {poojaName}
          </Text>
          <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textSecondary }}>
            Requested by {user?.name || "Devotee"}
          </Text>
        </View>
        {deadline && (
          <View style={{ backgroundColor: COLORS.warningBg, borderRadius: RADIUS.md, padding: rp(6), alignItems: "center" }}>
            <Text style={{ fontFamily: FONTS.body, fontSize: rf(9), color: COLORS.warning }}>RESPOND BY</Text>
            <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(12), color: COLORS.warning }}>{deadline}</Text>
          </View>
        )}
      </View>

      {/* Details */}
      <View style={{ backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.md, padding: rp(12), marginBottom: rp(14), gap: rs(6) }}>
        <View style={{ flexDirection: "row", gap: rs(8) }}>
          <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textDim, width: rs(60) }}>📅 Date</Text>
          <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(12), color: COLORS.textPrimary }}>{booking.scheduledDate}</Text>
        </View>
        <View style={{ flexDirection: "row", gap: rs(8) }}>
          <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textDim, width: rs(60) }}>🕐 Time</Text>
          <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(12), color: COLORS.textPrimary }}>{booking.scheduledTime}</Text>
        </View>
        <View style={{ flexDirection: "row", gap: rs(8) }}>
          <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textDim, width: rs(60) }}>📍 Venue</Text>
          <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(12), color: COLORS.textPrimary, flex: 1 }}>
            {booking.address?.city}, {booking.address?.state}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: rs(8) }}>
          <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textDim, width: rs(60) }}>💰 Fee</Text>
          <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(13), color: COLORS.ochre }}>₹{booking.panditFee}</Text>
        </View>
        {booking.samagriOption === "platform" && (
          <View style={{ flexDirection: "row", gap: rs(8) }}>
            <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textDim, width: rs(60) }}>📦 Samagri</Text>
            <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.success }}>Platform will deliver</Text>
          </View>
        )}
      </View>

      {booking.userNote && (
        <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textSecondary, fontStyle: "italic", marginBottom: rp(14) }}>
          "{booking.userNote}"
        </Text>
      )}

      {/* Action buttons */}
      <View style={{ flexDirection: "row", gap: rs(10) }}>
        <Button
          label="✓ Accept"
          style={{ flex: 1 }}
          onPress={() => onAccept(booking._id)}
          loading={accepting}
        />
        <Button
          label="✕ Decline"
          variant="outline"
          style={{ flex: 1 }}
          onPress={() => onDecline(booking._id)}
          loading={declining}
        />
      </View>
    </Card>
  );
}

export default function PanditRequestsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [declineModal, setDeclineModal] = useState(null);
  const [declineReason, setDeclineReason] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await bookingAPI.getIncoming();
      setBookings(res.data.bookings || []);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleAccept = async (bookingId) => {
    setActionId(bookingId);
    try {
      await bookingAPI.accept(bookingId);
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      Alert.alert("Accepted! 🙏", "Booking confirmed. The devotee will be notified.");
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || err.message);
    } finally {
      setActionId(null);
    }
  };

  const handleDecline = (bookingId) => {
    setDeclineModal(bookingId);
    setDeclineReason("");
  };

  const confirmDecline = async () => {
    if (!declineReason.trim())
      return Alert.alert("Required", "Please provide a reason for declining.");
    setActionId(declineModal);
    try {
      await bookingAPI.decline(declineModal, { reason: declineReason.trim() });
      setBookings((prev) => prev.filter((b) => b._id !== declineModal));
      setDeclineModal(null);
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || err.message);
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <LoadingScreen label="Loading requests..." />;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScreenHeader title="BOOKING REQUESTS" subtitle={bookings.length > 0 ? `${bookings.length} pending` : "All clear"} />

      <FlatList
        data={bookings}
        keyExtractor={(b) => b._id}
        renderItem={({ item }) => (
          <RequestCard
            booking={item}
            onAccept={handleAccept}
            onDecline={handleDecline}
            accepting={actionId === item._id}
            declining={actionId === item._id}
          />
        )}
        contentContainerStyle={{ padding: rp(20), paddingBottom: rp(32), ...(bookings.length === 0 && { flex: 1, justifyContent: "center" }) }}
        ListEmptyComponent={<EmptyState emoji="🙏" title="No pending requests" body="New booking requests will appear here. Stay online to receive them!" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={COLORS.ochre} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Decline reason modal */}
      <Modal visible={!!declineModal} transparent animationType="slide" onRequestClose={() => setDeclineModal(null)}>
        <View style={{ flex: 1, backgroundColor: COLORS.overlay, justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: COLORS.bgCard, borderTopLeftRadius: rs(24), borderTopRightRadius: rs(24), padding: rp(24), paddingBottom: rp(40) }}>
            <View style={{ width: rs(40), height: rs(4), backgroundColor: COLORS.border, borderRadius: 2, alignSelf: "center", marginBottom: rp(20) }} />
            <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(16), color: COLORS.textPrimary, marginBottom: rp(8) }}>
              Reason for declining
            </Text>
            <Text style={{ fontFamily: FONTS.body, fontSize: rf(13), color: COLORS.textSecondary, marginBottom: rp(14) }}>
              The devotee will see this reason so they can find another pandit.
            </Text>
            <TextInput
              style={{ backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: rp(12), fontFamily: FONTS.body, fontSize: rf(14), color: COLORS.textPrimary, height: rs(80), textAlignVertical: "top", marginBottom: rp(16) }}
              placeholder="e.g. Already booked on this date, travelling out of city..."
              placeholderTextColor={COLORS.textLight}
              value={declineReason}
              onChangeText={setDeclineReason}
              multiline
            />
            <View style={{ flexDirection: "row", gap: rs(10) }}>
              <Button label="Cancel" variant="outline" style={{ flex: 1 }} onPress={() => setDeclineModal(null)} />
              <Button label="Decline Booking" variant="danger" style={{ flex: 1 }} onPress={confirmDecline} loading={actionId === declineModal} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
