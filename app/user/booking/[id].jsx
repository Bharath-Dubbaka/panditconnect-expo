// app/user/booking/[id].jsx
import { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Modal,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { bookingAPI } from "../../../services/api";
import { COLORS, FONTS, RADIUS, STATUS_CONFIG } from "../../../constants/theme";
import { rf, rs, rp } from "../../../constants/responsive";
import { Button, Card, SectionHeader, InfoRow, LoadingScreen } from "../../../components/UI";

function ReviewModal({ visible, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit({ rating, comment });
    setSubmitting(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: COLORS.overlay, justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: COLORS.bgCard, borderTopLeftRadius: rs(24), borderTopRightRadius: rs(24), padding: rp(24), paddingBottom: rp(40) }}>
          <View style={{ width: rs(40), height: rs(4), backgroundColor: COLORS.border, borderRadius: 2, alignSelf: "center", marginBottom: rp(20) }} />
          <Text style={{ fontFamily: FONTS.headingBold, fontSize: rf(20), color: COLORS.ochre, letterSpacing: 1, textAlign: "center", marginBottom: rp(6) }}>
            Rate your experience
          </Text>
          <Text style={{ fontFamily: FONTS.body, fontSize: rf(13), color: COLORS.textSecondary, textAlign: "center", marginBottom: rp(20) }}>
            Your feedback helps other devotees find authentic pandits
          </Text>

          {/* Star selector */}
          <View style={{ flexDirection: "row", justifyContent: "center", gap: rs(10), marginBottom: rp(20) }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity key={s} onPress={() => setRating(s)}>
                <Text style={{ fontSize: rf(36), color: s <= rating ? COLORS.star : COLORS.starEmpty }}>★</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={{
              backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.md, borderWidth: 1,
              borderColor: COLORS.border, padding: rp(12), fontFamily: FONTS.body,
              fontSize: rf(14), color: COLORS.textPrimary, height: rs(90),
              textAlignVertical: "top", marginBottom: rp(16),
            }}
            placeholder="Share your experience (optional)"
            placeholderTextColor={COLORS.textLight}
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={1000}
          />

          <Button label="Submit Review 🙏" onPress={handleSubmit} loading={submitting} />
        </View>
      </View>
    </Modal>
  );
}

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await bookingAPI.getById(id);
      setBooking(res.data.booking);
    } catch {}
    finally { setLoading(false); }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleCancel = () => {
    Alert.alert("Cancel Booking", "Are you sure you want to cancel?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          setCancelling(true);
          try {
            await bookingAPI.cancel(id, { reason: "Cancelled by user" });
            load();
          } catch (err) {
            Alert.alert("Error", err?.response?.data?.message || err.message);
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  const handleReviewSubmit = async (data) => {
    try {
      await bookingAPI.submitReview(id, data);
      setShowReview(false);
      Alert.alert("Thank you! 🙏", "Your review has been submitted.");
      load();
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || err.message);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!booking) return null;

  const sc = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending_pandit;
  const pandit = booking.panditId;
  const canCancel = ["pending_pandit", "accepted"].includes(booking.status);
  const canReview = booking.status === "completed" && !booking.isReviewed;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={{ paddingHorizontal: rp(20), paddingTop: rs(56), paddingBottom: rp(14), backgroundColor: COLORS.bgCard, borderBottomWidth: 1, borderBottomColor: COLORS.border, flexDirection: "row", alignItems: "center", gap: rs(10) }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: rp(4) }}>
          <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(22), color: COLORS.textPrimary }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontFamily: FONTS.headingBold, fontSize: rf(17), color: COLORS.ochre, letterSpacing: 2, flex: 1 }}>BOOKING DETAILS</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: rp(20), paddingBottom: rp(100) }} showsVerticalScrollIndicator={false}>

        {/* Status banner */}
        <View style={{ backgroundColor: sc.bg, borderRadius: RADIUS.lg, padding: rp(18), marginBottom: rp(20), borderWidth: 1, borderColor: sc.color + "30", alignItems: "center" }}>
          <Text style={{ fontSize: rf(36), marginBottom: rp(8) }}>{sc.emoji}</Text>
          <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(16), color: sc.color, marginBottom: rp(4) }}>{sc.label}</Text>
          {booking.status === "pending_pandit" && (
            <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textSecondary, textAlign: "center" }}>
              Pandit has 2 hours to confirm your booking
            </Text>
          )}
          {booking.status === "accepted" && (
            <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textSecondary, textAlign: "center" }}>
              Your booking is confirmed! Pandit will arrive at the scheduled time.
            </Text>
          )}
          {booking.cancellationReason && (
            <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textDim, textAlign: "center", marginTop: rp(6), fontStyle: "italic" }}>
              Reason: {booking.cancellationReason}
            </Text>
          )}
        </View>

        {/* Booking summary */}
        <Card style={{ marginBottom: rp(16) }}>
          <SectionHeader label="BOOKING SUMMARY" />
          <InfoRow emoji="🪔" label="Pooja" value={booking.poojaName} />
          <InfoRow emoji="📅" label="Date" value={booking.scheduledDate} />
          <InfoRow emoji="🕐" label="Time" value={booking.scheduledTime} />
          <InfoRow emoji="⏱" label="Duration" value={`~${booking.durationMinutes} min`} last />
        </Card>

        {/* Pandit info */}
        {pandit && (
          <Card style={{ marginBottom: rp(16) }}>
            <SectionHeader label="PANDIT" />
            <InfoRow emoji="🙏" label="Name" value={pandit.name} />
            <InfoRow emoji="🕉️" label="Sampradaya" value={pandit.sampradaya} />
            {(booking.status === "accepted" || booking.status === "in_progress" || booking.status === "completed") && (
              <InfoRow emoji="📞" label="Phone" value={pandit.phone} last />
            )}
            {booking.status === "pending_pandit" && (
              <InfoRow emoji="📞" label="Phone" value="Shared after confirmation" last />
            )}
          </Card>
        )}

        {/* Address */}
        <Card style={{ marginBottom: rp(16) }}>
          <SectionHeader label="VENUE" />
          <Text style={{ fontFamily: FONTS.body, fontSize: rf(13), color: COLORS.textSecondary, lineHeight: rf(20) }}>
            {booking.address?.line1}{"\n"}
            {booking.address?.line2 ? `${booking.address.line2}\n` : ""}
            {booking.address?.city}, {booking.address?.state} - {booking.address?.pincode}
            {booking.address?.landmark ? `\nNear: ${booking.address.landmark}` : ""}
          </Text>
        </Card>

        {/* Samagri info */}
        {booking.samagriOption === "platform" && (
          <Card style={{ marginBottom: rp(16) }}>
            <SectionHeader label="SAMAGRI DELIVERY" />
            <InfoRow emoji="📦" label="Status" value={booking.samagriDeliveryStatus === "not_applicable" ? "Processing" : booking.samagriDeliveryStatus} />
            {booking.samagriDeliveryNote && (
              <InfoRow emoji="📝" label="Note" value={booking.samagriDeliveryNote} last />
            )}
          </Card>
        )}

        {/* Payment */}
        <Card style={{ marginBottom: rp(16) }}>
          <SectionHeader label="PAYMENT" />
          <InfoRow label="Pandit fee" value={`₹${booking.panditFee}`} />
          {booking.samagriTotal > 0 && <InfoRow label="Samagri kit" value={`₹${booking.samagriTotal}`} />}
          {booking.deliveryFee > 0 && <InfoRow label="Delivery" value={`₹${booking.deliveryFee}`} />}
          <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: rp(8) }} />
          <InfoRow label="Total" value={`₹${booking.totalAmount?.toLocaleString("en-IN")}`} last />
          <View style={{ marginTop: rp(8) }}>
            <View style={{
              alignSelf: "flex-start", backgroundColor: booking.paymentStatus === "paid" ? COLORS.successBg : COLORS.warningBg,
              borderRadius: RADIUS.full, paddingHorizontal: rp(10), paddingVertical: rp(3),
            }}>
              <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(11), color: booking.paymentStatus === "paid" ? COLORS.success : COLORS.warning }}>
                {booking.paymentStatus === "paid" ? "✓ Paid" : "⏳ Pending"}
              </Text>
            </View>
          </View>
        </Card>

        {/* Note */}
        {booking.userNote && (
          <Card style={{ marginBottom: rp(16) }}>
            <SectionHeader label="YOUR NOTE" />
            <Text style={{ fontFamily: FONTS.body, fontSize: rf(13), color: COLORS.textSecondary, lineHeight: rf(20) }}>
              {booking.userNote}
            </Text>
          </Card>
        )}

        {/* Review prompt */}
        {canReview && (
          <View style={{ backgroundColor: COLORS.ochrePale, borderRadius: RADIUS.lg, padding: rp(18), marginBottom: rp(16), borderWidth: 1, borderColor: COLORS.ochre + "40", alignItems: "center" }}>
            <Text style={{ fontSize: rf(32), marginBottom: rp(8) }}>⭐</Text>
            <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(15), color: COLORS.ochre, marginBottom: rp(6) }}>
              How was your experience?
            </Text>
            <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textSecondary, textAlign: "center", marginBottom: rp(14) }}>
              Help other devotees by sharing your feedback
            </Text>
            <Button label="Write a Review" onPress={() => setShowReview(true)} size="sm" style={{ width: rs(160) }} />
          </View>
        )}

        {booking.isReviewed && (
          <View style={{ backgroundColor: COLORS.successBg, borderRadius: RADIUS.md, padding: rp(14), alignItems: "center" }}>
            <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(13), color: COLORS.success }}>✓ Review submitted. Thank you! 🙏</Text>
          </View>
        )}
      </ScrollView>

      {/* Cancel button */}
      {canCancel && (
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: rp(16), paddingBottom: rp(32), backgroundColor: COLORS.bgCard, borderTopWidth: 1, borderTopColor: COLORS.border }}>
          <Button label="Cancel Booking" variant="outline" onPress={handleCancel} loading={cancelling} />
        </View>
      )}

      <ReviewModal visible={showReview} onClose={() => setShowReview(false)} onSubmit={handleReviewSubmit} />
    </View>
  );
}
