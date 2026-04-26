// app/user/book/[panditId].jsx
import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  Alert, Switch, ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { panditAPI, catalogAPI, bookingAPI } from "../../../services/api";
import { COLORS, FONTS, RADIUS } from "../../../constants/theme";
import { rf, rs, rp } from "../../../constants/responsive";
import { Button, ScreenHeader, Card, SectionHeader, LoadingScreen } from "../../../components/UI";

export default function BookingScreen() {
  const { panditId, poojaTypeId, poojaName } = useLocalSearchParams();
  const router = useRouter();

  const [pandit, setPandit] = useState(null);
  const [samagriKit, setSamagriKit] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Booking state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [orderSamagri, setOrderSamagri] = useState(false);
  const [userNote, setUserNote] = useState("");

  // Address fields
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [landmark, setLandmark] = useState("");

  useEffect(() => {
    Promise.all([
      panditAPI.getById(panditId),
      poojaTypeId ? catalogAPI.getSamagriKit(poojaTypeId) : Promise.resolve(null),
    ]).then(([panditRes, kitRes]) => {
      setPandit(panditRes.data.pandit);
      if (kitRes) setSamagriKit(kitRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Fetch slots whenever date changes
  useEffect(() => {
    if (!panditId) return;
    const dateStr = selectedDate.toISOString().split("T")[0];
    setLoadingSlots(true);
    setSelectedTime("");
    panditAPI.getSlots(panditId, { date: dateStr, poojaTypeId }).then((res) => {
      setAvailableSlots(res.data.slots || []);
      setLoadingSlots(false);
    }).catch(() => setLoadingSlots(false));
  }, [selectedDate]);

  const pricing = pandit?.pricingList?.find((p) => p.poojaTypeId?._id === poojaTypeId || p.poojaTypeId === poojaTypeId);
  const panditFee = pricing?.basePrice || 0;
  const samagriTotal = orderSamagri ? (samagriKit?.fullKitTotal || 0) : 0;
  const deliveryFee = orderSamagri && samagriTotal > 0 ? 49 : 0;
  const grandTotal = panditFee + samagriTotal + deliveryFee;

  const handleBook = async () => {
    if (!selectedTime) return Alert.alert("Required", "Please select a time slot.");
    if (!addressLine1.trim() || !city.trim() || !state.trim() || !pincode.trim())
      return Alert.alert("Required", "Please fill in your complete address.");

    setSubmitting(true);
    try {
      const samagriItems = orderSamagri && samagriKit
        ? samagriKit.kit.filter((k) => k.item?.inStock).map((k) => ({ itemId: k.item._id, quantity: k.quantity }))
        : [];

      const res = await bookingAPI.create({
        panditId,
        poojaTypeId,
        scheduledDate: selectedDate.toISOString().split("T")[0],
        scheduledTime: selectedTime,
        address: { line1: addressLine1.trim(), line2: addressLine2.trim(), city: city.trim(), state: state.trim(), pincode: pincode.trim(), landmark: landmark.trim() },
        samagriOption: orderSamagri ? "platform" : "self",
        samagriItems,
        userNote: userNote.trim(),
      });

      router.replace(`/user/booking/${res.data.booking._id}`);
    } catch (err) {
      Alert.alert("Booking Failed", err?.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen label="Loading details..." />;
  if (!pandit) return null;

  const dateStr = selectedDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  const inputStyle = {
    backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.md, borderWidth: 1,
    borderColor: COLORS.border, paddingHorizontal: rp(12), paddingVertical: rp(10),
    fontFamily: FONTS.body, fontSize: rf(14), color: COLORS.textPrimary, marginBottom: rp(10),
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScreenHeader title="BOOK PANDIT" subtitle={`${poojaName || "Pooja"} with ${pandit.name}`} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ padding: rp(20), paddingBottom: rp(130) }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Pandit + pooja summary */}
        <Card style={{ marginBottom: rp(20), flexDirection: "row", alignItems: "center", gap: rs(12) }}>
          <Text style={{ fontSize: rf(28) }}>{pricing?.poojaTypeId?.iconEmoji || "🪔"}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(14), color: COLORS.textPrimary }}>{poojaName || "Pooja"}</Text>
            <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textSecondary }}>with {pandit.name} · {pandit.sampradaya}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontFamily: FONTS.headingBold, fontSize: rf(18), color: COLORS.ochre }}>₹{panditFee}</Text>
            <Text style={{ fontFamily: FONTS.body, fontSize: rf(10), color: COLORS.textDim }}>{pricing?.durationMinutes} min</Text>
          </View>
        </Card>

        {/* Date picker */}
        <SectionHeader label="SELECT DATE" style={{ marginBottom: rp(8) }} />
        <TouchableOpacity
          style={{ backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: rp(14), marginBottom: rp(20), flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
          onPress={() => setShowDatePicker(true)}
        >
          <View>
            <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, marginBottom: rp(2) }}>SELECTED DATE</Text>
            <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(16), color: COLORS.textPrimary }}>{dateStr}</Text>
          </View>
          <Text style={{ fontSize: rf(20) }}>📅</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            minimumDate={new Date()}
            onChange={(_, date) => { setShowDatePicker(false); if (date) setSelectedDate(date); }}
            themeVariant="light"
          />
        )}

        {/* Time slots */}
        <SectionHeader label="SELECT TIME" style={{ marginBottom: rp(8) }} />
        {loadingSlots ? (
          <View style={{ alignItems: "center", padding: rp(20) }}>
            <ActivityIndicator color={COLORS.ochre} />
            <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textDim, marginTop: rp(8) }}>Checking availability...</Text>
          </View>
        ) : availableSlots.length === 0 ? (
          <View style={{ backgroundColor: COLORS.warningBg, borderRadius: RADIUS.md, padding: rp(14), marginBottom: rp(20), borderWidth: 1, borderColor: COLORS.warning + "30" }}>
            <Text style={{ fontFamily: FONTS.body, fontSize: rf(13), color: COLORS.warning, textAlign: "center" }}>
              No slots available on this date. Please choose another date.
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: rs(8), marginBottom: rp(20) }}>
            {availableSlots.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={{
                  paddingHorizontal: rp(14), paddingVertical: rp(9),
                  borderRadius: RADIUS.md, borderWidth: 1.5,
                  borderColor: selectedTime === slot ? COLORS.ochre : COLORS.border,
                  backgroundColor: selectedTime === slot ? COLORS.ochrePale : COLORS.bgCard,
                }}
                onPress={() => setSelectedTime(slot)}
              >
                <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(14), color: selectedTime === slot ? COLORS.ochre : COLORS.textSecondary }}>
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Address */}
        <SectionHeader label="POOJA VENUE ADDRESS" style={{ marginBottom: rp(8) }} />
        <TextInput style={inputStyle} placeholder="House / Flat No. & Street *" placeholderTextColor={COLORS.textLight} value={addressLine1} onChangeText={setAddressLine1} />
        <TextInput style={inputStyle} placeholder="Area / Colony (optional)" placeholderTextColor={COLORS.textLight} value={addressLine2} onChangeText={setAddressLine2} />
        <View style={{ flexDirection: "row", gap: rs(10) }}>
          <TextInput style={[inputStyle, { flex: 1 }]} placeholder="City *" placeholderTextColor={COLORS.textLight} value={city} onChangeText={setCity} />
          <TextInput style={[inputStyle, { flex: 1 }]} placeholder="State *" placeholderTextColor={COLORS.textLight} value={state} onChangeText={setState} />
        </View>
        <View style={{ flexDirection: "row", gap: rs(10) }}>
          <TextInput style={[inputStyle, { flex: 1 }]} placeholder="Pincode *" placeholderTextColor={COLORS.textLight} value={pincode} onChangeText={setPincode} keyboardType="number-pad" maxLength={6} />
          <TextInput style={[inputStyle, { flex: 1 }]} placeholder="Landmark (optional)" placeholderTextColor={COLORS.textLight} value={landmark} onChangeText={setLandmark} />
        </View>

        {/* Samagri option */}
        {samagriKit && samagriKit.kit?.length > 0 && (
          <Card style={{ marginTop: rp(4), marginBottom: rp(20) }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: rp(10) }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(14), color: COLORS.textPrimary, marginBottom: rp(2) }}>
                  🛍 Order Pooja Samagri
                </Text>
                <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textSecondary }}>
                  Complete kit delivered before your pooja
                </Text>
              </View>
              <Switch
                value={orderSamagri}
                onValueChange={setOrderSamagri}
                trackColor={{ false: COLORS.border, true: COLORS.ochre }}
                thumbColor="#fff"
              />
            </View>
            {orderSamagri && (
              <View style={{ backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.md, padding: rp(12) }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: rp(4) }}>
                  <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textSecondary }}>Kit ({samagriKit.kit?.length} items)</Text>
                  <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(12), color: COLORS.textPrimary }}>₹{samagriKit.fullKitTotal}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textSecondary }}>Delivery</Text>
                  <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(12), color: COLORS.textPrimary }}>₹49</Text>
                </View>
              </View>
            )}
          </Card>
        )}

        {/* Special instructions */}
        <SectionHeader label="SPECIAL INSTRUCTIONS (OPTIONAL)" style={{ marginBottom: rp(8) }} />
        <TextInput
          style={[inputStyle, { height: rs(80), textAlignVertical: "top" }]}
          placeholder="Any special requirements, family members count, etc."
          placeholderTextColor={COLORS.textLight}
          value={userNote}
          onChangeText={setUserNote}
          multiline
          maxLength={500}
        />

        {/* Price summary */}
        <Card style={{ marginTop: rp(8) }}>
          <SectionHeader label="PRICE SUMMARY" />
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: rp(6) }}>
            <Text style={{ fontFamily: FONTS.body, fontSize: rf(13), color: COLORS.textSecondary }}>Pandit fee</Text>
            <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(13), color: COLORS.textPrimary }}>₹{panditFee}</Text>
          </View>
          {orderSamagri && (
            <>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: rp(6) }}>
                <Text style={{ fontFamily: FONTS.body, fontSize: rf(13), color: COLORS.textSecondary }}>Samagri kit</Text>
                <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(13), color: COLORS.textPrimary }}>₹{samagriTotal}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: rp(6) }}>
                <Text style={{ fontFamily: FONTS.body, fontSize: rf(13), color: COLORS.textSecondary }}>Delivery</Text>
                <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(13), color: COLORS.textPrimary }}>₹{deliveryFee}</Text>
              </View>
            </>
          )}
          <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: rp(8) }} />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(15), color: COLORS.textPrimary }}>Total</Text>
            <Text style={{ fontFamily: FONTS.headingBold, fontSize: rf(18), color: COLORS.ochre }}>₹{grandTotal.toLocaleString("en-IN")}</Text>
          </View>
          <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, marginTop: rp(6) }}>
            * Payment collected after pandit confirms
          </Text>
        </Card>
      </ScrollView>

      {/* Footer */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: rp(16), paddingBottom: rp(32), backgroundColor: COLORS.bgCard, borderTopWidth: 1, borderTopColor: COLORS.border }}>
        <Button
          label={`Request Booking · ₹${grandTotal.toLocaleString("en-IN")} 🪔`}
          onPress={handleBook}
          loading={submitting}
          disabled={!selectedTime}
        />
      </View>
    </View>
  );
}
