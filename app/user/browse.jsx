// app/user/browse.jsx
import { useState, useEffect, useCallback } from "react";
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { panditAPI, catalogAPI } from "../../services/api";
import { COLORS, FONTS, RADIUS } from "../../constants/theme";
import { rf, rs, rp } from "../../constants/responsive";
import { EmptyState, LoadingScreen } from "../../components/UI";
import PanditCard from "../../components/PanditCard";

const LANGUAGES = ["Any", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Sanskrit"];
const SAMPRADAYAS = ["Any", "Shaiva", "Vaishnava", "Shakta", "Smartha"];
const SORT_OPTIONS = [
  { key: "rating", label: "Top Rated" },
  { key: "experience", label: "Most Experienced" },
];

export default function BrowseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [pandits, setPandits] = useState([]);
  const [poojaTypes, setPoojaTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [city, setCity] = useState("");
  const [selectedPooja, setSelectedPooja] = useState(params.poojaId || "");
  const [selectedLanguage, setSelectedLanguage] = useState("Any");
  const [selectedSampradaya, setSelectedSampradaya] = useState("Any");
  const [minRating, setMinRating] = useState(0);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = {};
      if (city.trim()) params.city = city.trim();
      if (selectedPooja) params.poojaTypeId = selectedPooja;
      if (selectedLanguage !== "Any") params.language = selectedLanguage;
      if (selectedSampradaya !== "Any") params.sampradaya = selectedSampradaya;
      if (minRating > 0) params.minRating = minRating;

      const res = await panditAPI.search(params);
      setPandits(res.data.pandits || []);
    } catch (err) {
      console.error("[BROWSE]", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [city, selectedPooja, selectedLanguage, selectedSampradaya, minRating]);

  useEffect(() => {
    catalogAPI.getPoojas().then((res) => setPoojaTypes(res.data.poojas || [])).catch(() => {});
    load();
  }, []);

  useEffect(() => { load(); }, [selectedPooja, selectedLanguage, selectedSampradaya, minRating]);

  const FilterPill = ({ label, active, onPress }) => (
    <TouchableOpacity
      style={{
        paddingHorizontal: rp(12), paddingVertical: rp(6),
        borderRadius: RADIUS.full, borderWidth: 1.5,
        borderColor: active ? COLORS.ochre : COLORS.border,
        backgroundColor: active ? COLORS.ochrePale : "transparent",
        marginRight: rs(8),
      }}
      onPress={onPress}
    >
      <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(12), color: active ? COLORS.ochre : COLORS.textSecondary }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: rp(20), paddingTop: rs(56), paddingBottom: rp(12), backgroundColor: COLORS.bgCard, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
        <Text style={{ fontFamily: FONTS.headingBold, fontSize: rf(18), color: COLORS.ochre, letterSpacing: 2, marginBottom: rp(12) }}>
          FIND A PANDIT
        </Text>
        {/* Search */}
        <View style={{ flexDirection: "row", gap: rs(10) }}>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: rp(12) }}>
            <Text style={{ fontSize: rf(14), color: COLORS.textDim, marginRight: rs(6) }}>📍</Text>
            <TextInput
              style={{ flex: 1, fontFamily: FONTS.body, fontSize: rf(14), color: COLORS.textPrimary, paddingVertical: rp(10) }}
              placeholder="City (e.g. Hyderabad)"
              placeholderTextColor={COLORS.textLight}
              value={city}
              onChangeText={setCity}
              onSubmitEditing={() => load()}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: showFilters ? COLORS.ochre : COLORS.bgElevated,
              borderRadius: RADIUS.md, borderWidth: 1,
              borderColor: showFilters ? COLORS.ochre : COLORS.border,
              paddingHorizontal: rp(14), alignItems: "center", justifyContent: "center",
            }}
            onPress={() => setShowFilters((v) => !v)}
          >
            <Text style={{ fontSize: rf(16) }}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Expandable filters */}
      {showFilters && (
        <View style={{ backgroundColor: COLORS.bgCard, paddingHorizontal: rp(20), paddingVertical: rp(14), borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
          <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, letterSpacing: 2, marginBottom: rp(8) }}>LANGUAGE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: rp(12) }}>
            {LANGUAGES.map((l) => (
              <FilterPill key={l} label={l} active={selectedLanguage === l} onPress={() => setSelectedLanguage(l)} />
            ))}
          </ScrollView>
          <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, letterSpacing: 2, marginBottom: rp(8) }}>TRADITION</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: rp(12) }}>
            {SAMPRADAYAS.map((s) => (
              <FilterPill key={s} label={s} active={selectedSampradaya === s} onPress={() => setSelectedSampradaya(s)} />
            ))}
          </ScrollView>
          <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, letterSpacing: 2, marginBottom: rp(8) }}>MIN RATING</Text>
          <View style={{ flexDirection: "row", gap: rs(8) }}>
            {[0, 3, 4, 4.5].map((r) => (
              <FilterPill key={r} label={r === 0 ? "Any" : `${r}★+`} active={minRating === r} onPress={() => setMinRating(r)} />
            ))}
          </View>
        </View>
      )}

      {/* Pooja filter chips */}
      {poojaTypes.length > 0 && (
        <View style={{ borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: rp(20), paddingVertical: rp(10), gap: rs(8) }}>
            <FilterPill label="All Poojas" active={!selectedPooja} onPress={() => setSelectedPooja("")} />
            {poojaTypes.map((p) => (
              <FilterPill key={p._id} label={`${p.iconEmoji} ${p.name}`} active={selectedPooja === p._id} onPress={() => setSelectedPooja(p._id)} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results */}
      {loading ? (
        <LoadingScreen label="Finding pandits..." />
      ) : (
        <FlatList
          data={pandits}
          keyExtractor={(p) => p._id}
          renderItem={({ item }) => {
            const pricing = selectedPooja ? item.pricingList?.find((pl) => pl.poojaTypeId === selectedPooja) : null;
            return (
              <PanditCard
                pandit={item}
                poojaPrice={pricing?.basePrice}
                style={{ marginHorizontal: rp(20), marginBottom: rp(12) }}
                onPress={(p) => router.push(`/user/pandit/${p._id}`)}
              />
            );
          }}
          contentContainerStyle={{ paddingTop: rp(16), paddingBottom: rp(32), ...(pandits.length === 0 && { flex: 1, justifyContent: "center" }) }}
          ListHeaderComponent={
            pandits.length > 0 ? (
              <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textDim, paddingHorizontal: rp(20), marginBottom: rp(8) }}>
                {pandits.length} pandits found
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState emoji="🙏" title="No pandits found" body="Try a different city, tradition, or remove some filters" />
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={COLORS.ochre} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
