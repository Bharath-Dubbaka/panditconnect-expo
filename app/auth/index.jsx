// app/auth/index.jsx
// Single auth screen — tab toggle between User and Pandit,
// and between Login and Register within each.

import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  loginUser,
  registerUser,
  loginPandit,
  registerPandit,
  clearError,
  selectAuthLoading,
  selectAuthError,
} from "../../store/slices/authSlice";
import { COLORS, FONTS, RADIUS } from "../../constants/theme";
import { rf, rs, rp } from "../../constants/responsive";
import { Button } from "../../components/UI";

const ROLES = ["User", "Pandit"];
const SAMPRADAYAS = ["Shaiva", "Vaishnava", "Shakta", "Smartha", "Other"];

export default function AuthScreen() {
  const dispatch = useDispatch();
  const authLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);

  const [role, setRole] = useState("User");       // "User" | "Pandit"
  const [mode, setMode] = useState("login");      // "login" | "register"

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  // Pandit-only registration fields
  const [sampradaya, setSampradaya] = useState("Shaiva");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    dispatch(clearError());
  }, [role, mode]);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim())
      return Alert.alert("Required", "Please enter your email and password.");

    if (mode === "register") {
      if (!name.trim())
        return Alert.alert("Required", "Please enter your name.");
      if (password.length < 6)
        return Alert.alert("Weak Password", "Password must be at least 6 characters.");
      if (role === "Pandit" && (!city.trim() || !state.trim()))
        return Alert.alert("Required", "Please enter your city and state.");
    }

    if (role === "User") {
      const action = mode === "login"
        ? loginUser({ email: email.trim(), password })
        : registerUser({ name: name.trim(), email: email.trim(), password, phone });
      dispatch(action);
    } else {
      const action = mode === "login"
        ? loginPandit({ email: email.trim(), password })
        : registerPandit({ name: name.trim(), email: email.trim(), password, phone, sampradaya, city: city.trim(), state: state.trim() });
      dispatch(action);
    }
  };

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
    marginBottom: rp(12),
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: rp(24) }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand */}
        <Animated.View style={{ alignItems: "center", marginBottom: rp(36), opacity: fadeAnim }}>
          <Text style={{ fontSize: rf(48), marginBottom: rp(8) }}>🪔</Text>
          <Text style={{ fontFamily: FONTS.headingBold, fontSize: rf(26), color: COLORS.ochre, letterSpacing: 4 }}>
            PANDITCONNECT
          </Text>
          <Text style={{ fontFamily: FONTS.body, fontSize: rf(13), color: COLORS.textSecondary, marginTop: rp(4) }}>
            Authentic Vedic Rituals at your doorstep
          </Text>
        </Animated.View>

        {/* Role toggle */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: COLORS.bgElevated,
            borderRadius: RADIUS.lg,
            padding: 4,
            marginBottom: rp(20),
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r}
              style={{
                flex: 1,
                paddingVertical: rp(10),
                alignItems: "center",
                borderRadius: RADIUS.md,
                backgroundColor: role === r ? COLORS.ochre : "transparent",
              }}
              onPress={() => { setRole(r); setMode("login"); }}
            >
              <Text style={{ fontFamily: FONTS.bodyBold, fontSize: rf(14), color: role === r ? "#fff" : COLORS.textSecondary }}>
                {r === "User" ? "🙏 Devotee" : "📿 Pandit"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mode toggle */}
        <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: rp(20) }}>
          {["login", "register"].map((m) => (
            <TouchableOpacity
              key={m}
              style={{ flex: 1, paddingVertical: rp(10), alignItems: "center", borderBottomWidth: 2, borderBottomColor: mode === m ? COLORS.ochre : "transparent" }}
              onPress={() => setMode(m)}
            >
              <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(14), color: mode === m ? COLORS.ochre : COLORS.textSecondary }}>
                {m === "login" ? "Sign In" : "Register"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <Animated.View style={{ opacity: fadeAnim }}>
          {mode === "register" && (
            <>
              <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, letterSpacing: 2, marginBottom: rp(6) }}>
                FULL NAME
              </Text>
              <TextInput
                style={inputStyle}
                placeholder="Your name"
                placeholderTextColor={COLORS.textLight}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, letterSpacing: 2, marginBottom: rp(6) }}>
                PHONE (OPTIONAL)
              </Text>
              <TextInput
                style={inputStyle}
                placeholder="+91 XXXXX XXXXX"
                placeholderTextColor={COLORS.textLight}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </>
          )}

          <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, letterSpacing: 2, marginBottom: rp(6) }}>
            EMAIL
          </Text>
          <TextInput
            style={inputStyle}
            placeholder="your@email.com"
            placeholderTextColor={COLORS.textLight}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, letterSpacing: 2, marginBottom: rp(6) }}>
            PASSWORD
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: rp(12) }}>
            <TextInput
              style={[inputStyle, { flex: 1, marginBottom: 0 }]}
              placeholder={mode === "register" ? "Min 6 characters" : "Your password"}
              placeholderTextColor={COLORS.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={{ padding: rp(10), marginLeft: rs(4) }} onPress={() => setShowPassword((v) => !v)}>
              <Text style={{ fontSize: rf(18) }}>{showPassword ? "🙈" : "👁"}</Text>
            </TouchableOpacity>
          </View>

          {/* Pandit-only registration fields */}
          {role === "Pandit" && mode === "register" && (
            <>
              <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, letterSpacing: 2, marginBottom: rp(8) }}>
                SAMPRADAYA (TRADITION)
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: rs(8), marginBottom: rp(12) }}>
                {SAMPRADAYAS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={{
                      paddingHorizontal: rp(12),
                      paddingVertical: rp(7),
                      borderRadius: RADIUS.full,
                      borderWidth: 1,
                      borderColor: sampradaya === s ? COLORS.ochre : COLORS.border,
                      backgroundColor: sampradaya === s ? COLORS.ochrePale : "transparent",
                    }}
                    onPress={() => setSampradaya(s)}
                  >
                    <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: rf(13), color: sampradaya === s ? COLORS.ochre : COLORS.textSecondary }}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ flexDirection: "row", gap: rs(10) }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, letterSpacing: 2, marginBottom: rp(6) }}>CITY</Text>
                  <TextInput
                    style={inputStyle}
                    placeholder="Hyderabad"
                    placeholderTextColor={COLORS.textLight}
                    value={city}
                    onChangeText={setCity}
                    autoCapitalize="words"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONTS.body, fontSize: rf(11), color: COLORS.textDim, letterSpacing: 2, marginBottom: rp(6) }}>STATE</Text>
                  <TextInput
                    style={inputStyle}
                    placeholder="Telangana"
                    placeholderTextColor={COLORS.textLight}
                    value={state}
                    onChangeText={setState}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            </>
          )}

          {/* Error */}
          {authError && (
            <View style={{ backgroundColor: COLORS.errorBg, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.error + "40", padding: rp(12), marginBottom: rp(12) }}>
              <Text style={{ fontFamily: FONTS.body, fontSize: rf(13), color: COLORS.error, textAlign: "center" }}>
                ⚠️ {authError}
              </Text>
            </View>
          )}

          <Button
            label={mode === "login" ? `Sign In as ${role}` : `Create ${role} Account`}
            onPress={handleSubmit}
            loading={authLoading}
            style={{ marginTop: rp(4) }}
          />

          {role === "Pandit" && mode === "register" && (
            <Text style={{ fontFamily: FONTS.body, fontSize: rf(12), color: COLORS.textDim, textAlign: "center", marginTop: rp(14), lineHeight: rf(18) }}>
              🔍 Your profile will be reviewed by our team within 24-48 hours before going live.
            </Text>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
