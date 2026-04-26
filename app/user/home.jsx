// app/user/home.jsx
import { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, FlatList, TouchableOpacity,
  TextInput, RefreshControl, ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { catalogAPI, panditAPI } from "../../services/api";
import { COLORS, FONTS, RADIUS } from "../../constants/theme";
import { rf, rs, rp } from "../../constants/responsive";
import { SectionHeader, EmptyState } from "../../components/UI";
import PoojaCard from "../../components/PoojaCard";
import PanditCard from "../../components/PanditCard";

const CATEGORIES = [
  { key: "all", label: "All", emoji: "✨" },
  { key: "Griha", label: "Home", emoji: "🏠" },
  { key: "Life Event", label: "Life Events", emoji: "🎉" },
  { key: "Festival", label: "Festivals", emoji: "🪔" },
  { key: "Navagraha", label: "Planetary", emoji: "🪐" },
  { key: "Weekly", label: "Regular", emoji: "📅" },
];

export default function HomeScreen() {
  const router = useRouter();
  const user = useSelector(selectUser);

  const [featuredPoojas, setFeaturedPoojas] = useState([]);
  const [allPoojas, setAllPoojas] = useState([]);
  const [topPandits, setTopPandits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchText, setSearchText] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [poojaRes, panditRes] = await Promise.all([
        catalogAPI.getPoojas(),
        panditAPI.search({ city: user?.city, limit: 6 }),
      ]);
      const poojas = poojaRes.data.poojas || [];
      setFeaturedPoojas(poojas.filter((p) => p.isFeatured));
      setAllPoojas(poojas);
      setTopPandits(panditRes.data.pandits || []);
    } catch (err) {
      console.error("[HOME]", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.city]);

  useFocusEffect(useCallback(() => { load(true); }, [load]));

  const filteredPoojas = allPoojas.filter((p) => {
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    const matchSearch = !searchText || p.name.toLowerCase().includes(searchText.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={COLORS.ochre} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={COLORS.ochre} />}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: rp(20), paddingTop: rs(56), paddingBottom: rp(16), backgroundColor: COLORS.bgCard, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
        <Text style={{ fontFamily: FONTS.headingBold, fontSize: rf(22), color: COLORS.ochre, letterSpacing: 3 }}>
          🪔 PANDITCONNECT
        </Text>
        <Text style={{ fontFamily: FONTS.body, fontSize: rf(13), color: COLORS.textSecondary, marginTop: rp(2) }}>
          Namaste, {user?.name?.split(" ")[0] || "Devotee"} 🙏
        </Text>
      </View>

      {/* Search bar */}
      <View style={{ paddingHorizontal: rp(20), paddingTop: rp(16), paddingBottom: rp(8) }}>
        <View style={{
          flexDirection: "row", alignItems: "center", gap: rs(10),
          backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
          borderWidth: 1, borderColor: COLORS.border,
          paddingHorizontal: rp(14), paddingVertical: rp(10),
        }}>
          <Text style={{ fontSize: rf(16), color: COLORS.textDim }}>🔍</Text>
          <TextInput
            style={{ flex: 1, fontFamily: FONTS.body, fontSize: rf(14), color: COLORS.textPrimary }}
            placeholder="Search poojas..."
            placeholderTextColor={COLORS.textLight}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Text style={{ fontSize: rf(14), color: COLORS.textDim }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: rp(20), paddingVertical: rp(8), gap: rs(8) }}>
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={{
                flexDirection: "row", alignItems: "center", gap: rs(6),
                paddingHorizontal: rp(14), paddingVertical: rp(8),
                borderRadius: RADIUS.full, borderWidth: 1.5,
                borderColor: active ? COLORS.ochre : COLORS.border,
                backgroundColor: active ? COLORS.ochrePale : COLORS.bgCard,
              }}
              onPress={() => setActiveCategory(cat.key)}
            >
              <Text style={{ fontSize: rf(14) }}>{cat.emoji}</Text>
              <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(12), color: active ? COLORS.ochre : COLORS.textSecondary }}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Featured poojas grid */}
      {!searchText && activeCategory === "all" && featuredPoojas.length > 0 && (
        <View style={{ paddingHorizontal: rp(20), paddingTop: rp(20) }}>
          <SectionHeader label="POPULAR POOJAS" />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: rs(10) }}>
            {featuredPoojas.map((pooja) => (
              <PoojaCard
                key={pooja._id}
                pooja={pooja}
                compact
                style={{ width: (rs(375) - rp(40) - rs(10)) / 3, minWidth: rs(90) }}
                onPress={(p) => router.push({ pathname: "/user/browse", params: { poojaId: p._id, poojaName: p.name } })}
              />
            ))}
          </View>
        </View>
      )}

      {/* All / filtered poojas */}
      <View style={{ paddingHorizontal: rp(20), paddingTop: rp(24) }}>
        <SectionHeader
          label={searchText ? `RESULTS (${filteredPoojas.length})` : activeCategory === "all" ? "ALL POOJAS" : activeCategory.toUpperCase()}
        />
        {filteredPoojas.length === 0 ? (
          <EmptyState emoji="🪔" title="No poojas found" body="Try a different search or category" />
        ) : (
          <View style={{ gap: rs(10) }}>
            {filteredPoojas.map((pooja) => (
              <PoojaCard
                key={pooja._id}
                pooja={pooja}
                onPress={(p) => router.push({ pathname: "/user/browse", params: { poojaId: p._id, poojaName: p.name } })}
              />
            ))}
          </View>
        )}
      </View>

      {/* Top pandits near you */}
      {!searchText && topPandits.length > 0 && (
        <View style={{ paddingHorizontal: rp(20), paddingTop: rp(28), paddingBottom: rp(32) }}>
          <SectionHeader
            label={user?.city ? `PANDITS IN ${user.city.toUpperCase()}` : "TOP PANDITS"}
            right={
              <TouchableOpacity onPress={() => router.push("/user/browse")}>
                <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(12), color: COLORS.ochre }}>See all →</Text>
              </TouchableOpacity>
            }
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: rs(12) }}>
            {topPandits.map((pandit) => (
              <PanditCard
                key={pandit._id}
                pandit={pandit}
                style={{ width: rs(220) }}
                onPress={(p) => router.push(`/user/pandit/${p._id}`)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      <View style={{ height: rp(20) }} />
    </ScrollView>
  );
}
