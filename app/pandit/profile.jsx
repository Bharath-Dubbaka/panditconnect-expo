// app/pandit/profile.jsx
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { logout, updateUser, selectUser } from "../../store/slices/authSlice";
import { authAPI, panditDashAPI } from "../../services/api";

import {
  COLORS,
  FONTS,
  RADIUS,
  SAMPRADAYA_CONFIG,
} from "../../constants/theme";
import { rf, rs, rp } from "../../constants/responsive";
import {
  ScreenHeader,
  Card,
  SectionHeader,
  Button,
  InfoRow,
  StarRating,
} from "../../components/UI";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function PanditProfileScreen() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [loggingOut, setLoggingOut] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(user?.bio || "");
  const [savingBio, setSavingBio] = useState(false);

  const sc = user?.sampradaya
    ? SAMPRADAYA_CONFIG[user.sampradaya] || SAMPRADAYA_CONFIG.Other
    : SAMPRADAYA_CONFIG.Other;

  const handleSaveBio = async () => {
    setSavingBio(true);
    try {
      await authAPI.updateMe({ bio: bio.trim() });
      dispatch(updateUser({ bio: bio.trim() }));
      setEditingBio(false);
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || err.message);
    } finally {
      setSavingBio(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);

          await dispatch(logout());
        },
      },
    ]);
  };

  const inputStyle = {
    backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: rp(12),
    paddingVertical: rp(10),
    fontFamily: FONTS.body,
    fontSize: rf(14),
    color: COLORS.textPrimary,
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ paddingBottom: rp(40) }}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="MY PROFILE" />

      {/* Avatar + name */}
      <View
        style={{
          alignItems: "center",
          paddingVertical: rp(28),
          backgroundColor: COLORS.bgCard,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}
      >
        <View
          style={{
            width: rs(88),
            height: rs(88),
            borderRadius: rs(44),
            backgroundColor: COLORS.bgOchre,
            borderWidth: 2,
            borderColor: sc.color + "60",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: rp(12),
          }}
        >
          <Text
            style={{
              fontFamily: FONTS.headingBold,
              fontSize: rf(34),
              color: COLORS.ochre,
            }}
          >
            {user?.name?.[0]?.toUpperCase() || "P"}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: FONTS.headingBold,
            fontSize: rf(20),
            color: COLORS.textPrimary,
          }}
        >
          {user?.name}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: rs(6),
            marginTop: rp(4),
          }}
        >
          <Text style={{ fontSize: rf(14) }}>{sc.emoji}</Text>
          <Text
            style={{
              fontFamily: FONTS.body,
              fontSize: rf(13),
              color: sc.color,
            }}
          >
            {user?.sampradaya}
          </Text>
        </View>

        {/* Verification status */}
        <View
          style={{
            marginTop: rp(10),
            backgroundColor:
              user?.verificationStatus === "verified"
                ? COLORS.successBg
                : COLORS.warningBg,
            borderRadius: RADIUS.full,
            paddingHorizontal: rp(14),
            paddingVertical: rp(5),
          }}
        >
          <Text
            style={{
              fontFamily: FONTS.bodyMedium,
              fontSize: rf(12),
              color:
                user?.verificationStatus === "verified"
                  ? COLORS.success
                  : COLORS.warning,
            }}
          >
            {user?.verificationStatus === "verified"
              ? "✓ Verified Pandit"
              : user?.verificationStatus === "under_review"
              ? "⏳ Under Review"
              : "⚠️ Pending Verification"}
          </Text>
        </View>

        {/* Rating */}
        {(user?.averageRating > 0 || user?.totalReviews > 0) && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: rs(8),
              marginTop: rp(10),
            }}
          >
            <StarRating rating={user?.averageRating || 0} size={14} />
            <Text
              style={{
                fontFamily: FONTS.body,
                fontSize: rf(12),
                color: COLORS.textDim,
              }}
            >
              ({user?.totalReviews || 0} reviews)
            </Text>
          </View>
        )}
      </View>

      <View style={{ paddingHorizontal: rp(20), paddingTop: rp(20) }}>
        {/* Bio */}
        <Card style={{ marginBottom: rp(16) }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: rp(10),
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.body,
                fontSize: rf(11),
                color: COLORS.textDim,
                letterSpacing: 2,
              }}
            >
              BIO
            </Text>
            <TouchableOpacity onPress={() => setEditingBio((v) => !v)}>
              <Text
                style={{
                  fontFamily: FONTS.bodyMedium,
                  fontSize: rf(13),
                  color: COLORS.ochre,
                }}
              >
                {editingBio ? "Cancel" : "✏️ Edit"}
              </Text>
            </TouchableOpacity>
          </View>
          {editingBio ? (
            <>
              <TextInput
                style={[
                  inputStyle,
                  {
                    height: rs(100),
                    textAlignVertical: "top",
                    marginBottom: rp(10),
                  },
                ]}
                value={bio}
                onChangeText={setBio}
                multiline
                maxLength={600}
                placeholder="Tell devotees about yourself..."
                placeholderTextColor={COLORS.textLight}
              />
              <Button
                label="Save Bio"
                onPress={handleSaveBio}
                loading={savingBio}
                size="sm"
              />
            </>
          ) : (
            <Text
              style={{
                fontFamily: FONTS.body,
                fontSize: rf(13),
                color: user?.bio ? COLORS.textSecondary : COLORS.textDim,
                lineHeight: rf(20),
                fontStyle: user?.bio ? "normal" : "italic",
              }}
            >
              {user?.bio || "Add a bio to help devotees know you better..."}
            </Text>
          )}
        </Card>

        {/* Credentials */}
        <Card style={{ marginBottom: rp(16) }}>
          <SectionHeader label="CREDENTIALS" />
          <InfoRow emoji="🕉️" label="Sampradaya" value={user?.sampradaya} />
          <InfoRow emoji="📖" label="Veda" value={user?.veda} />
          <InfoRow emoji="🧬" label="Gotram" value={user?.gotram} />
          <InfoRow
            emoji="⏳"
            label="Experience"
            value={`${user?.yearsExperience || 0} years`}
          />
          <InfoRow
            emoji="🗣"
            label="Languages"
            value={user?.languages?.join(", ")}
            last
          />
        </Card>

        {/* Availability summary */}
        {user?.availability?.length > 0 && (
          <Card style={{ marginBottom: rp(16) }}>
            <SectionHeader label="AVAILABILITY" />
            {user.availability.map((slot, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: rp(6),
                  borderBottomWidth: i < user.availability.length - 1 ? 1 : 0,
                  borderBottomColor: COLORS.borderLight,
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.bodyMedium,
                    fontSize: rf(13),
                    color: COLORS.textPrimary,
                  }}
                >
                  {slot.day}
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: rf(13),
                    color: COLORS.textSecondary,
                  }}
                >
                  {slot.startTime} – {slot.endTime}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Account */}
        <Card style={{ marginBottom: rp(16) }}>
          <SectionHeader label="ACCOUNT" />
          <InfoRow emoji="✉️" label="Email" value={user?.email} />
          <InfoRow emoji="📞" label="Phone" value={user?.phone} />
          <InfoRow
            emoji="📍"
            label="City"
            value={`${user?.city}, ${user?.state}`}
            last
          />
        </Card>

        <Card>
          <TouchableOpacity
            style={{
              paddingVertical: rp(12),
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            onPress={handleLogout}
            disabled={loggingOut}
          >
            <Text
              style={{
                fontFamily: FONTS.body,
                fontSize: rf(14),
                color: COLORS.error,
              }}
            >
              {loggingOut ? "Signing out..." : "Sign Out"}
            </Text>
            <Text style={{ fontSize: rf(16), color: COLORS.error }}>›</Text>
          </TouchableOpacity>
        </Card>

        <Text
          style={{
            fontFamily: FONTS.body,
            fontSize: rf(11),
            color: COLORS.textDim,
            textAlign: "center",
            marginTop: rp(20),
          }}
        >
          PanditConnect · v1.0
        </Text>
      </View>
    </ScrollView>
  );
}
