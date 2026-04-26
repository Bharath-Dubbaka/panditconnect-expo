// app/onboarding/credentials.jsx
import { useState } from "react";
import {
  View, Text, ScrollView, TextInput,
  TouchableOpacity, Alert, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { onboardingAPI } from "../../services/api";
import { COLORS, FONTS, RADIUS } from "../../constants/theme";
import { rf, rs, rp } from "../../constants/responsive";
import { Button, ScreenHeader } from "../../components/UI";

const SAMPRADAYAS = ["Shaiva", "Vaishnava", "Shakta", "Smartha", "Other"];
const VEDAS = ["Rigveda", "Yajurveda", "Samaveda", "Atharvaveda", "Multiple", "N/A"];

const ChipRow = ({ options, selected, onSelect, label }) => (
  <View style={{ marginBottom: rp(18) }}>
    <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, letterSpacing: 2, marginBottom: rp(8) }}>
      {label}
    </Text>
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: rs(8) }}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={{
            paddingHorizontal: rp(14),
            paddingVertical: rp(8),
            borderRadius: RADIUS.full,
            borderWidth: 1.5,
            borderColor: selected === opt ? COLORS.ochre : COLORS.border,
            backgroundColor: selected === opt ? COLORS.ochrePale : "transparent",
          }}
          onPress={() => onSelect(opt)}
        >
          <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(13), color: selected === opt ? COLORS.ochre : COLORS.textSecondary }}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export default function CredentialsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sampradaya, setSampradaya] = useState("Shaiva");
  const [veda, setVeda] = useState("Yajurveda");
  const [gotram, setGotram] = useState("");
  const [gurukul, setGurukul] = useState("");
  const [yearsExperience, setYearsExperience] = useState("5");
  const [bio, setBio] = useState("");

  const inputStyle = {
    backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: rp(14),
    paddingVertical: rp(12),
    fontFamily: FONTS.body,
    fontSize: rf(15),
    color: COLORS.textPrimary,
    marginBottom: rp(14),
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      await onboardingAPI.saveCredentials({
        sampradaya, veda, gotram: gotram.trim(),
        gurukul: gurukul.trim(),
        yearsExperience: parseInt(yearsExperience) || 0,
        bio: bio.trim(),
      });
      router.push("/onboarding/services");
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScreenHeader title="YOUR CREDENTIALS" subtitle="Step 1 of 4" />

      <ScrollView
        contentContainerStyle={{ padding: rp(20), paddingBottom: rp(120) }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info box */}
        <View style={{ backgroundColor: COLORS.ochrePale, borderRadius: RADIUS.md, padding: rp(14), marginBottom: rp(20), borderWidth: 1, borderColor: COLORS.ochreDim + "40" }}>
          <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(13), color: COLORS.ochre, marginBottom: rp(4) }}>
            🔍 Why we need this
          </Text>
          <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textSecondary, lineHeight: rf(19) }}>
            Authenticity is our core promise. Your credentials help devotees find the right pandit for their tradition.
          </Text>
        </View>

        <ChipRow label="SAMPRADAYA (TRADITION)" options={SAMPRADAYAS} selected={sampradaya} onSelect={setSampradaya} />
        <ChipRow label="VEDA TRAINING" options={VEDAS} selected={veda} onSelect={setVeda} />

        <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, letterSpacing: 2, marginBottom: rp(6) }}>
          GOTRAM (OPTIONAL)
        </Text>
        <TextInput
          style={inputStyle}
          placeholder="e.g. Kashyapa, Bharadwaja"
          placeholderTextColor={COLORS.textLight}
          value={gotram}
          onChangeText={setGotram}
        />

        <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, letterSpacing: 2, marginBottom: rp(6) }}>
          GURUKUL / INSTITUTION (OPTIONAL)
        </Text>
        <TextInput
          style={inputStyle}
          placeholder="Where you received your training"
          placeholderTextColor={COLORS.textLight}
          value={gurukul}
          onChangeText={setGurukul}
        />

        <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, letterSpacing: 2, marginBottom: rp(6) }}>
          YEARS OF EXPERIENCE
        </Text>
        <TextInput
          style={[inputStyle, { width: rs(120) }]}
          placeholder="5"
          placeholderTextColor={COLORS.textLight}
          value={yearsExperience}
          onChangeText={setYearsExperience}
          keyboardType="number-pad"
          maxLength={2}
        />

        <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, letterSpacing: 2, marginBottom: rp(6) }}>
          BIO (OPTIONAL)
        </Text>
        <TextInput
          style={[inputStyle, { height: rs(100), textAlignVertical: "top" }]}
          placeholder="Tell devotees about your experience, specialisations, and approach..."
          placeholderTextColor={COLORS.textLight}
          value={bio}
          onChangeText={setBio}
          multiline
          maxLength={600}
        />
        <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, textAlign: "right", marginTop: -rp(8), marginBottom: rp(16) }}>
          {bio.length}/600
        </Text>
      </ScrollView>

      {/* Footer */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: rp(20), paddingBottom: rp(36), backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border }}>
        <Button label="Continue → Services" onPress={handleNext} loading={loading} />
      </View>
    </View>
  );
}
