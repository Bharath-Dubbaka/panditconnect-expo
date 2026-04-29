// app/user/bookings.jsx
import { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { bookingAPI } from "../../services/api";
import { COLORS, FONTS, RADIUS } from "../../constants/theme";
import { rf, rs, rp } from "../../constants/responsive";
import { ScreenHeader, LoadingScreen, EmptyState } from "../../components/UI";
import BookingCard from "../../components/BookingCard";

const STATUS_TABS = [
  { key: "", label: "All" },
  { key: "pending_pandit", label: "Pending" },
  { key: "accepted", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled_user", label: "Cancelled" },
];

export default function UserBookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeStatus, setActiveStatus] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = activeStatus ? { status: activeStatus } : {};
      const res = await bookingAPI.getMyBookings(params);
      setBookings(res.data.bookings || []);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, [activeStatus]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <LoadingScreen label="Loading bookings..." />;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScreenHeader title="MY BOOKINGS" />

      {/* Status tabs */}
      <View style={{ borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
        <FlatList
          horizontal
          data={STATUS_TABS}
          keyExtractor={(t) => t.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: rp(16), paddingVertical: rp(10), gap: rs(8) }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                paddingHorizontal: rp(14), paddingVertical: rp(7),
                borderRadius: RADIUS.full, borderWidth: 1.5,
                borderColor: activeStatus === item.key ? COLORS.ochre : COLORS.border,
                backgroundColor: activeStatus === item.key ? COLORS.ochrePale : "transparent",
              }}
              onPress={() => setActiveStatus(item.key)}
            >
              <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(12), color: activeStatus === item.key ? COLORS.ochre : COLORS.textSecondary }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(b) => b._id}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            viewAs="user"
            onPress={(b) => router.push(`/user/booking/${b._id}`)}
          />
        )}
        contentContainerStyle={{
          padding: rp(20),
          paddingBottom: rp(32),
          ...(bookings.length === 0 && { flex: 1, justifyContent: "center" }),
        }}
        ListEmptyComponent={
          <EmptyState emoji="📅" title="No bookings yet" body="Book a pandit for your next pooja from the home screen" />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={COLORS.ochre} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
