// app/user/profile.jsx
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { logout, updateUser, selectUser } from "../../store/slices/authSlice";
import { authAPI } from "../../services/api";
// REMOVED: import { disconnectSocket } from "../../services/socket" — socket.io not used in PanditConnect
import { COLORS, FONTS, RADIUS } from "../../constants/theme";
import { rf, rs, rp } from "../../constants/responsive";
import {
  ScreenHeader,
  Card,
  SectionHeader,
  Button,
  InfoRow,
} from "../../components/UI";

const LANGUAGES = [
  "Hindi",
  "Telugu",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Sanskrit",
  "Marathi",
  "Bengali",
  "Gujarati",
  "Other",
];
const TRADITIONS = ["Any", "Shaiva", "Vaishnava", "Shakta", "Smartha"];

export default function UserProfileScreen() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [loggingOut, setLoggingOut] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [city, setCity] = useState(user?.city || "");
  const [state, setState] = useState(user?.state || "");
  const [saving, setSaving] = useState(false);
  const [preferredLang, setPreferredLang] = useState(
    user?.preferredLanguage || "Hindi"
  );
  const [preferredTrad, setPreferredTrad] = useState(
    user?.preferredTradition || "Any"
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await authAPI.updateMe({
        name: name.trim(),
        city: city.trim(),
        state: state.trim(),
        preferredLanguage: preferredLang,
        preferredTradition: preferredTrad,
      });
      dispatch(
        updateUser({
          name: name.trim(),
          city: city.trim(),
          state: state.trim(),
          preferredLanguage: preferredLang,
          preferredTradition: preferredTrad,
        })
      );
      setEditMode(false);
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
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
          // disconnectSocket() removed — socket not used in PanditConnect
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
    marginBottom: rp(10),
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ paddingBottom: rp(40) }}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        title="MY PROFILE"
        right={
          <TouchableOpacity
            onPress={() => setEditMode((v) => !v)}
            style={{ padding: rp(6) }}
          >
            <Text
              style={{
                fontFamily: FONTS.bodyMedium,
                fontSize: rf(13),
                color: COLORS.ochre,
              }}
            >
              {editMode ? "Cancel" : "✏️ Edit"}
            </Text>
          </TouchableOpacity>
        }
      />

      {/* Avatar placeholder */}
      <View style={{ alignItems: "center", paddingVertical: rp(28) }}>
        <View
          style={{
            width: rs(88),
            height: rs(88),
            borderRadius: rs(44),
            backgroundColor: COLORS.bgOchre,
            borderWidth: 2,
            borderColor: COLORS.ochre + "40",
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
            {user?.name?.[0]?.toUpperCase() || "U"}
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
        <Text
          style={{
            fontFamily: FONTS.body,
            fontSize: rf(13),
            color: COLORS.textSecondary,
            marginTop: rp(2),
          }}
        >
          {user?.email}
        </Text>
      </View>

      <View style={{ paddingHorizontal: rp(20) }}>
        {editMode ? (
          <Card style={{ marginBottom: rp(16) }}>
            <SectionHeader label="EDIT DETAILS" />
            <Text
              style={{
                fontFamily: FONTS.body,
                fontSize: rf(11),
                color: COLORS.textDim,
                letterSpacing: 2,
                marginBottom: rp(6),
              }}
            >
              NAME
            </Text>
            <TextInput
              style={inputStyle}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={COLORS.textLight}
            />
            <View style={{ flexDirection: "row", gap: rs(10) }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: rf(11),
                    color: COLORS.textDim,
                    letterSpacing: 2,
                    marginBottom: rp(6),
                  }}
                >
                  CITY
                </Text>
                <TextInput
                  style={inputStyle}
                  value={city}
                  onChangeText={setCity}
                  placeholder="City"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: rf(11),
                    color: COLORS.textDim,
                    letterSpacing: 2,
                    marginBottom: rp(6),
                  }}
                >
                  STATE
                </Text>
                <TextInput
                  style={inputStyle}
                  value={state}
                  onChangeText={setState}
                  placeholder="State"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
            </View>

            <Text
              style={{
                fontFamily: FONTS.body,
                fontSize: rf(11),
                color: COLORS.textDim,
                letterSpacing: 2,
                marginBottom: rp(8),
              }}
            >
              PREFERRED LANGUAGE
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: rs(8),
                marginBottom: rp(14),
              }}
            >
              {LANGUAGES.slice(0, 6).map((l) => (
                <TouchableOpacity
                  key={l}
                  style={{
                    paddingHorizontal: rp(10),
                    paddingVertical: rp(6),
                    borderRadius: RADIUS.full,
                    borderWidth: 1,
                    borderColor:
                      preferredLang === l ? COLORS.ochre : COLORS.border,
                    backgroundColor:
                      preferredLang === l ? COLORS.ochrePale : "transparent",
                  }}
                  onPress={() => setPreferredLang(l)}
                >
                  <Text
                    style={{
                      fontFamily: FONTS.bodyMedium,
                      fontSize: rf(12),
                      color:
                        preferredLang === l
                          ? COLORS.ochre
                          : COLORS.textSecondary,
                    }}
                  >
                    {l}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text
              style={{
                fontFamily: FONTS.body,
                fontSize: rf(11),
                color: COLORS.textDim,
                letterSpacing: 2,
                marginBottom: rp(8),
              }}
            >
              PREFERRED TRADITION
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: rs(8),
                marginBottom: rp(16),
              }}
            >
              {TRADITIONS.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={{
                    paddingHorizontal: rp(10),
                    paddingVertical: rp(6),
                    borderRadius: RADIUS.full,
                    borderWidth: 1,
                    borderColor:
                      preferredTrad === t ? COLORS.ochre : COLORS.border,
                    backgroundColor:
                      preferredTrad === t ? COLORS.ochrePale : "transparent",
                  }}
                  onPress={() => setPreferredTrad(t)}
                >
                  <Text
                    style={{
                      fontFamily: FONTS.bodyMedium,
                      fontSize: rf(12),
                      color:
                        preferredTrad === t
                          ? COLORS.ochre
                          : COLORS.textSecondary,
                    }}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              label="Save Changes"
              onPress={handleSave}
              loading={saving}
            />
          </Card>
        ) : (
          <Card style={{ marginBottom: rp(16) }}>
            <SectionHeader label="ACCOUNT DETAILS" />
            <InfoRow emoji="👤" label="Name" value={user?.name} />
            <InfoRow emoji="✉️" label="Email" value={user?.email} />
            <InfoRow
              emoji="📞"
              label="Phone"
              value={user?.phone || "Not set"}
            />
            <InfoRow emoji="📍" label="City" value={user?.city || "Not set"} />
            <InfoRow
              emoji="🗣"
              label="Language"
              value={user?.preferredLanguage}
            />
            <InfoRow
              emoji="🕉️"
              label="Tradition"
              value={user?.preferredTradition}
              last
            />
          </Card>
        )}

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
