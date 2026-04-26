// app/pandit/earnings.jsx
import { useState, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl, Alert, TextInput, TouchableOpacity } from "react-native";
import { useFocusEffect } from "expo-router";
import { panditDashAPI } from "../../services/api";
import { COLORS, FONTS, RADIUS } from "../../constants/theme";
import { rf, rs, rp } from "../../constants/responsive";
import { ScreenHeader, Card, SectionHeader, Button, LoadingScreen } from "../../components/UI";

export default function EarningsScreen() {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await panditDashAPI.getEarnings();
      setEarnings(res.data.earnings);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSaveBank = async () => {
    setSavingBank(true);
    try {
      await panditDashAPI.saveBankDetails({ upiId, bankName, accountNumber, ifscCode, accountHolderName: "" });
      setShowBankForm(false);
      Alert.alert("Saved! ✅", "Your payment details have been saved.");
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || err.message);
    } finally { setSavingBank(false); }
  };

  if (loading) return <LoadingScreen label="Loading earnings..." />;

  const inputStyle = {
    backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.md, borderWidth: 1,
    borderColor: COLORS.border, paddingHorizontal: rp(12), paddingVertical: rp(10),
    fontFamily: FONTS.body, fontSize: rf(14), color: COLORS.textPrimary, marginBottom: rp(10),
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={COLORS.ochre} />}
    >
      <ScreenHeader title="EARNINGS" />

      <View style={{ padding: rp(20) }}>

        {/* Summary cards */}
        <View style={{ flexDirection: "row", gap: rs(10), marginBottom: rp(20) }}>
          <View style={{ flex: 1, backgroundColor: COLORS.ochre, borderRadius: RADIUS.lg, padding: rp(18), alignItems: "center" }}>
            <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: "rgba(255,255,255,0.8)", marginBottom: rp(4) }}>TOTAL EARNED</Text>
            <Text style={{ fontFamily: FONTS.headingBold, fontSize: rf(24), color: "#fff" }}>
              ₹{(earnings?.totalEarnings || 0).toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={{ flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: rp(18), alignItems: "center", borderWidth: 1, borderColor: COLORS.border }}>
            <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, marginBottom: rp(4) }}>PENDING PAYOUT</Text>
            <Text style={{ fontFamily: FONTS.headingBold, fontSize: rf(24), color: COLORS.ochre }}>
              ₹{(earnings?.pendingPayout || 0).toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        {/* Payout info */}
        <View style={{ backgroundColor: COLORS.infoBg, borderRadius: RADIUS.md, padding: rp(14), marginBottom: rp(20), borderWidth: 1, borderColor: COLORS.info + "30" }}>
          <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(13), color: COLORS.info, marginBottom: rp(4) }}>💰 How payouts work</Text>
          <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textSecondary, lineHeight: rf(18) }}>
            You keep 90% of each booking fee. Payouts are processed weekly every Monday via UPI or bank transfer.
          </Text>
        </View>

        {/* Bank details */}
        <Card style={{ marginBottom: rp(20) }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: rp(14) }}>
            <SectionHeader label="PAYMENT DETAILS" style={{ marginBottom: 0 }} />
            <TouchableOpacity onPress={() => setShowBankForm((v) => !v)}>
              <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(13), color: COLORS.ochre }}>
                {showBankForm ? "Cancel" : "✏️ Edit"}
              </Text>
            </TouchableOpacity>
          </View>
          {showBankForm ? (
            <>
              <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, letterSpacing: 2, marginBottom: rp(6) }}>UPI ID (RECOMMENDED)</Text>
              <TextInput style={inputStyle} placeholder="yourname@upi" placeholderTextColor={COLORS.textLight} value={upiId} onChangeText={setUpiId} autoCapitalize="none" />
              <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: rp(10) }} />
              <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, letterSpacing: 2, marginBottom: rp(6) }}>OR BANK ACCOUNT</Text>
              <TextInput style={inputStyle} placeholder="Bank Name" placeholderTextColor={COLORS.textLight} value={bankName} onChangeText={setBankName} />
              <TextInput style={inputStyle} placeholder="Account Number" placeholderTextColor={COLORS.textLight} value={accountNumber} onChangeText={setAccountNumber} keyboardType="number-pad" />
              <TextInput style={inputStyle} placeholder="IFSC Code" placeholderTextColor={COLORS.textLight} value={ifscCode} onChangeText={setIfscCode} autoCapitalize="characters" />
              <Button label="Save Payment Details" onPress={handleSaveBank} loading={savingBank} />
            </>
          ) : (
            <Text style={{ fontFamily: FONTS.body, fontSize: rf(13), color: COLORS.textSecondary }}>
              {upiId || "No payment details saved yet. Add your UPI ID or bank account."}
            </Text>
          )}
        </Card>

        {/* Completed bookings */}
        {earnings?.completedBookings?.length > 0 && (
          <>
            <SectionHeader label="RECENT EARNINGS" />
            {earnings.completedBookings.slice(0, 10).map((booking, i) => (
              <View key={i} style={{
                flexDirection: "row", justifyContent: "space-between", alignItems: "center",
                paddingVertical: rp(12), borderBottomWidth: i < earnings.completedBookings.length - 1 ? 1 : 0, borderBottomColor: COLORS.border,
              }}>
                <View>
                  <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(13), color: COLORS.textPrimary }}>{booking.poojaName}</Text>
                  <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim }}>📅 {booking.scheduledDate}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(14), color: COLORS.success }}>+₹{booking.payoutAmount}</Text>
                  <View style={{ backgroundColor: booking.payoutStatus === "paid" ? COLORS.successBg : COLORS.warningBg, borderRadius: RADIUS.full, paddingHorizontal: rp(8), paddingVertical: rp(2), marginTop: rp(2) }}>
                    <Text style={{ fontFamily: FONTS.body, fontSize: rf(9), color: booking.payoutStatus === "paid" ? COLORS.success : COLORS.warning }}>
                      {booking.payoutStatus === "paid" ? "Paid" : "Pending"}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {(!earnings?.completedBookings?.length) && (
          <View style={{ alignItems: "center", paddingVertical: rp(32) }}>
            <Text style={{ fontSize: rf(40), marginBottom: rp(12) }}>💰</Text>
            <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(15), color: COLORS.textSecondary, textAlign: "center" }}>
              No earnings yet.{"\n"}Complete bookings to see your earnings here.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
