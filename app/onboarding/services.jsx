// app/onboarding/services.jsx
import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TextInput,
  TouchableOpacity, Alert, FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { onboardingAPI, catalogAPI } from "../../services/api";
import { COLORS, FONTS, RADIUS } from "../../constants/theme";
import { rf, rs, rp } from "../../constants/responsive";
import { Button, ScreenHeader, LoadingScreen } from "../../components/UI";

const LANGUAGES = ["Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Sanskrit", "Marathi", "Bengali", "Gujarati", "Other"];
const TRAVEL_OPTIONS = [10, 20, 30, 50, 100];

export default function ServicesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [poojaTypes, setPoojaTypes] = useState([]);
  const [fetchingPoojas, setFetchingPoojas] = useState(true);

  const [selectedLanguages, setSelectedLanguages] = useState(["Hindi", "Sanskrit"]);
  const [travelRadius, setTravelRadius] = useState(20);
  // Map of poojaTypeId → { basePrice, durationMinutes } — selected poojas
  const [selectedPoojas, setSelectedPoojas] = useState({});

  useEffect(() => {
    catalogAPI.getPoojas().then((res) => {
      setPoojaTypes(res.data.poojas || []);
      setFetchingPoojas(false);
    }).catch(() => setFetchingPoojas(false));
  }, []);

  const toggleLanguage = (lang) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const togglePooja = (pooja) => {
    setSelectedPoojas((prev) => {
      if (prev[pooja._id]) {
        const next = { ...prev };
        delete next[pooja._id];
        return next;
      }
      return { ...prev, [pooja._id]: { basePrice: "", durationMinutes: String(pooja.minDurationMinutes || 90) } };
    });
  };

  const updatePoojaField = (poojaId, field, value) => {
    setSelectedPoojas((prev) => ({
      ...prev,
      [poojaId]: { ...prev[poojaId], [field]: value },
    }));
  };

  const handleNext = async () => {
    if (!selectedLanguages.length)
      return Alert.alert("Required", "Select at least one language.");
    const pricingList = Object.entries(selectedPoojas).map(([poojaTypeId, data]) => ({
      poojaTypeId,
      basePrice: parseFloat(data.basePrice) || 0,
      durationMinutes: parseInt(data.durationMinutes) || 90,
    }));
    if (!pricingList.length)
      return Alert.alert("Required", "Select at least one pooja service.");
    const missingPrice = pricingList.find((p) => p.basePrice <= 0);
    if (missingPrice)
      return Alert.alert("Missing Price", "Please enter your fee for all selected poojas.");

    setLoading(true);
    try {
      await onboardingAPI.saveServices({ languages: selectedLanguages, pricingList, travelRadiusKm: travelRadius });
      router.push("/onboarding/availability");
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingPoojas) return <LoadingScreen label="Loading pooja catalog..." />;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScreenHeader title="SERVICES & PRICING" subtitle="Step 2 of 4" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ padding: rp(20), paddingBottom: rp(120) }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Languages */}
        <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, letterSpacing: 2, marginBottom: rp(10) }}>
          LANGUAGES YOU PERFORM IN
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: rs(8), marginBottom: rp(24) }}>
          {LANGUAGES.map((lang) => {
            const selected = selectedLanguages.includes(lang);
            return (
              <TouchableOpacity
                key={lang}
                style={{
                  paddingHorizontal: rp(12), paddingVertical: rp(7),
                  borderRadius: RADIUS.full, borderWidth: 1.5,
                  borderColor: selected ? COLORS.ochre : COLORS.border,
                  backgroundColor: selected ? COLORS.ochrePale : "transparent",
                }}
                onPress={() => toggleLanguage(lang)}
              >
                <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(13), color: selected ? COLORS.ochre : COLORS.textSecondary }}>
                  {lang}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Travel radius */}
        <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, letterSpacing: 2, marginBottom: rp(10) }}>
          TRAVEL RADIUS
        </Text>
        <View style={{ flexDirection: "row", gap: rs(8), marginBottom: rp(24) }}>
          {TRAVEL_OPTIONS.map((km) => (
            <TouchableOpacity
              key={km}
              style={{
                flex: 1, paddingVertical: rp(9), alignItems: "center",
                borderRadius: RADIUS.md, borderWidth: 1.5,
                borderColor: travelRadius === km ? COLORS.ochre : COLORS.border,
                backgroundColor: travelRadius === km ? COLORS.ochrePale : "transparent",
              }}
              onPress={() => setTravelRadius(km)}
            >
              <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(14), color: travelRadius === km ? COLORS.ochre : COLORS.textSecondary }}>
                {km}km
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pooja selection */}
        <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, letterSpacing: 2, marginBottom: rp(4) }}>
          POOJA SERVICES YOU OFFER
        </Text>
        <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textSecondary, marginBottom: rp(12) }}>
          Tap to select, then set your fee
        </Text>

        {poojaTypes.map((pooja) => {
          const isSelected = !!selectedPoojas[pooja._id];
          return (
            <View key={pooja._id} style={{ marginBottom: rp(10) }}>
              <TouchableOpacity
                style={{
                  flexDirection: "row", alignItems: "center", gap: rs(12),
                  backgroundColor: isSelected ? COLORS.ochrePale : COLORS.bgCard,
                  borderRadius: RADIUS.md, padding: rp(14),
                  borderWidth: 1.5, borderColor: isSelected ? COLORS.ochre : COLORS.border,
                }}
                onPress={() => togglePooja(pooja)}
              >
                <Text style={{ fontSize: rf(24) }}>{pooja.iconEmoji || "🪔"}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(14), color: COLORS.textPrimary }}>{pooja.name}</Text>
                  <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim }}>
                    {pooja.minDurationMinutes}–{pooja.maxDurationMinutes} min
                  </Text>
                </View>
                <View style={{
                  width: rs(22), height: rs(22), borderRadius: rs(11),
                  borderWidth: 1.5, borderColor: isSelected ? COLORS.ochre : COLORS.border,
                  backgroundColor: isSelected ? COLORS.ochre : "transparent",
                  alignItems: "center", justifyContent: "center",
                }}>
                  {isSelected && <Text style={{ color: "#fff", fontSize: rf(12), fontWeight: "bold" }}>✓</Text>}
                </View>
              </TouchableOpacity>

              {isSelected && (
                <View style={{
                  flexDirection: "row", gap: rs(10), padding: rp(12),
                  backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.md,
                  borderWidth: 1, borderColor: COLORS.border,
                  borderTopWidth: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0,
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, marginBottom: rp(4) }}>YOUR FEE (₹)</Text>
                    <TextInput
                      style={{ backgroundColor: COLORS.bgCard, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: rp(10), paddingVertical: rp(8), fontFamily: FONTS.bodyBold, fontSize: rf(16), color: COLORS.ochre }}
                      placeholder="500"
                      placeholderTextColor={COLORS.textLight}
                      value={selectedPoojas[pooja._id]?.basePrice}
                      onChangeText={(v) => updatePoojaField(pooja._id, "basePrice", v)}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, marginBottom: rp(4) }}>DURATION (MIN)</Text>
                    <TextInput
                      style={{ backgroundColor: COLORS.bgCard, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: rp(10), paddingVertical: rp(8), fontFamily: FONTS.bodyBold, fontSize: rf(16), color: COLORS.textPrimary }}
                      placeholder="90"
                      placeholderTextColor={COLORS.textLight}
                      value={selectedPoojas[pooja._id]?.durationMinutes}
                      onChangeText={(v) => updatePoojaField(pooja._id, "durationMinutes", v)}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: rp(20), paddingBottom: rp(36), backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border }}>
        <Button label="Continue → Availability" onPress={handleNext} loading={loading} />
      </View>
    </View>
  );
}
