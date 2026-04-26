// store/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI } from "../../services/api";

const initialState = {
  user: null, // user or pandit object
  token: null,
  userType: null, // "user" | "pandit"
  loading: true,
  authLoading: false,
  error: null,
};

// ── Init: restore session from AsyncStorage ───────────────
// ── Init: restore session from AsyncStorage ───────────────
export const initAuth = createAsyncThunk(
  "auth/init",
  async (_, { rejectWithValue }) => {
    try {
      const [token, userStr, userType] = await Promise.all([
        AsyncStorage.getItem("token"),
        AsyncStorage.getItem("user"),
        AsyncStorage.getItem("userType"),
      ]);
      const storedUser = userStr ? JSON.parse(userStr) : null;
      if (!token || !storedUser)
        return { token: null, user: null, userType: null };
      return { token, user: storedUser, userType };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── User login ────────────────────────────────────────────
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await authAPI.loginUser({ email, password });
      const { token, user } = res.data;
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("userType", "user");
      return { token, user, userType: "user" };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

// ── User register ─────────────────────────────────────────
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authAPI.registerUser(data);
      const { token, user } = res.data;
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("userType", "user");
      return { token, user, userType: "user" };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Registration failed"
      );
    }
  }
);

// ── Pandit login ──────────────────────────────────────────
export const loginPandit = createAsyncThunk(
  "auth/loginPandit",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await authAPI.loginPandit({ email, password });
      const { token, pandit } = res.data;
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(pandit));
      await AsyncStorage.setItem("userType", "pandit");
      return { token, user: pandit, userType: "pandit" };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

// ── Pandit register ───────────────────────────────────────
export const registerPandit = createAsyncThunk(
  "auth/registerPandit",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authAPI.registerPandit(data);
      const { token, pandit } = res.data;
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(pandit));
      await AsyncStorage.setItem("userType", "pandit");
      return { token, user: pandit, userType: "pandit" };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Registration failed"
      );
    }
  }
);

// ── Logout ────────────────────────────────────────────────
export const logout = createAsyncThunk("auth/logout", async () => {
  await AsyncStorage.multiRemove(["token", "user", "userType"]);
  return null;
});

// ── Update local user ─────────────────────────────────────
export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async (updates, { getState }) => {
    const current = getState().auth.user;
    const updated = { ...current, ...updates };
    await AsyncStorage.setItem("user", JSON.stringify(updated));
    return updated;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.authLoading = true;
      state.error = null;
    };
    const handleFulfilled = (state, action) => {
      state.authLoading = false;
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.userType = action.payload.userType;
    };
    const handleRejected = (state, action) => {
      state.authLoading = false;
      state.error = action.payload;
    };

    builder
      .addCase(initAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.userType = action.payload.userType;
      })
      .addCase(initAuth.rejected, (state) => {
        state.loading = false;
      })

      .addCase(loginUser.pending, handlePending)
      .addCase(loginUser.fulfilled, handleFulfilled)
      .addCase(loginUser.rejected, handleRejected)

      .addCase(registerUser.pending, handlePending)
      .addCase(registerUser.fulfilled, handleFulfilled)
      .addCase(registerUser.rejected, handleRejected)

      .addCase(loginPandit.pending, handlePending)
      .addCase(loginPandit.fulfilled, handleFulfilled)
      .addCase(loginPandit.rejected, handleRejected)

      .addCase(registerPandit.pending, handlePending)
      .addCase(registerPandit.fulfilled, handleFulfilled)
      .addCase(registerPandit.rejected, handleRejected)

      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.userType = null;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;

export const selectUser = (s) => s.auth.user;
export const selectToken = (s) => s.auth.token;
export const selectUserType = (s) => s.auth.userType;
export const selectIsLoading = (s) => s.auth.loading;
export const selectAuthLoading = (s) => s.auth.authLoading;
export const selectAuthError = (s) => s.auth.error;
export const selectIsPandit = (s) => s.auth.userType === "pandit";

export default authSlice.reducer;
