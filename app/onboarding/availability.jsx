// app/onboarding/availability.jsx
import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { onboardingAPI } from "../../services/api";
import { COLORS, FONTS, RADIUS } from "../../constants/theme";
import { rf, rs, rp } from "../../constants/responsive";
import { Button, ScreenHeader } from "../../components/UI";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIME_SLOTS = ["05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

const DEFAULT_SCHEDULE = {
  Mon: { active: true, start: "07:00", end: "19:00" },
  Tue: { active: true, start: "07:00", end: "19:00" },
  Wed: { active: true, start: "07:00", end: "19:00" },
  Thu: { active: true, start: "07:00", end: "19:00" },
  Fri: { active: true, start: "07:00", end: "19:00" },
  Sat: { active: true, start: "06:00", end: "20:00" },
  Sun: { active: true, start: "06:00", end: "20:00" },
};

function TimeDropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ position: "relative" }}>
      <TouchableOpacity
        style={{
          backgroundColor: COLORS.bgCard, borderRadius: RADIUS.sm,
          borderWidth: 1, borderColor: COLORS.border,
          paddingHorizontal: rp(10), paddingVertical: rp(7),
          flexDirection: "row", alignItems: "center", gap: rs(4),
        }}
        onPress={() => setOpen((v) => !v)}
      >
        <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(13), color: COLORS.textPrimary }}>{value}</Text>
        <Text style={{ color: COLORS.textDim, fontSize: rf(10) }}>▾</Text>
      </TouchableOpacity>
      {open && (
        <View style={{
          position: "absolute", top: rs(34), left: 0, zIndex: 99,
          backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
          borderWidth: 1, borderColor: COLORS.border,
          maxHeight: rs(160), width: rs(90),
          shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, elevation: 8,
        }}>
          <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
            {options.map((t) => (
              <TouchableOpacity
                key={t}
                style={{ padding: rp(10), borderBottomWidth: 1, borderBottomColor: COLORS.borderLight, backgroundColor: value === t ? COLORS.ochrePale : "transparent" }}
                onPress={() => { onChange(t); setOpen(false); }}
              >
                <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(13), color: value === t ? COLORS.ochre : COLORS.textPrimary }}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

export default function AvailabilityScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);

  const toggleDay = (day) => {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], active: !prev[day].active } }));
  };

  const updateTime = (day, field, value) => {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const handleNext = async () => {
    const availability = DAYS
      .filter((d) => schedule[d].active)
      .map((d) => ({ day: d, startTime: schedule[d].start, endTime: schedule[d].end }));

    if (!availability.length)
      return Alert.alert("Required", "Please select at least one working day.");

    setLoading(true);
    try {
      await onboardingAPI.saveAvailability({ availability });
      router.push("/onboarding/complete");
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScreenHeader title="AVAILABILITY" subtitle="Step 3 of 4" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ padding: rp(20), paddingBottom: rp(120) }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontFamily: FONTS.body, fontSize: rf(13), color: COLORS.textSecondary, marginBottom: rp(20), lineHeight: rf(20) }}>
          Set your weekly working schedule. Devotees will only be able to book you during these hours.
        </Text>

        {DAYS.map((day) => {
          const s = schedule[day];
          return (
            <View key={day} style={{ marginBottom: rp(12) }}>
              <View style={{
                flexDirection: "row", alignItems: "center",
                backgroundColor: s.active ? COLORS.bgCard : COLORS.bgElevated,
                borderRadius: RADIUS.md, padding: rp(14),
                borderWidth: 1, borderColor: s.active ? COLORS.ochre + "50" : COLORS.border,
              }}>
                {/* Day toggle */}
                <TouchableOpacity
                  style={{
                    width: rs(44), height: rs(44), borderRadius: rs(22),
                    backgroundColor: s.active ? COLORS.ochre : COLORS.bgElevated,
                    alignItems: "center", justifyContent: "center",
                    borderWidth: 1.5, borderColor: s.active ? COLORS.ochre : COLORS.border,
                    marginRight: rs(12), flexShrink: 0,
                  }}
                  onPress={() => toggleDay(day)}
                >
                  <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(12), color: s.active ? "#fff" : COLORS.textDim }}>
                    {day}
                  </Text>
                </TouchableOpacity>

                {s.active ? (
                  <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: rs(8) }}>
                    <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textDim }}>From</Text>
                    <TimeDropdown value={s.start} onChange={(v) => updateTime(day, "start", v)} options={TIME_SLOTS} />
                    <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textDim }}>To</Text>
                    <TimeDropdown value={s.end} onChange={(v) => updateTime(day, "end", v)} options={TIME_SLOTS} />
                  </View>
                ) : (
                  <Text style={{ fontFamily: FONTS.body, fontSize: rf(13), color: COLORS.textDim, flex: 1 }}>
                    Not available
                  </Text>
                )}
              </View>
            </View>
          );
        })}

        <View style={{ backgroundColor: COLORS.infoBg, borderRadius: RADIUS.md, padding: rp(14), marginTop: rp(8), borderWidth: 1, borderColor: COLORS.info + "30" }}>
          <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.info, lineHeight: rf(18) }}>
            💡 You can block specific dates anytime from your dashboard after going live.
          </Text>
        </View>
      </ScrollView>

      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: rp(20), paddingBottom: rp(36), backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border }}>
        <Button label="Continue → Submit" onPress={handleNext} loading={loading} />
      </View>
    </View>
  );
}
