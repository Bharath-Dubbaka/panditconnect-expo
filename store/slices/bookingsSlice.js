// store/slices/bookingsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { bookingAPI } from "../../services/api";

const initialState = {
  bookings: [],
  loading: false,
  error: null,
};

export const fetchMyBookings = createAsyncThunk(
  "bookings/fetchMy",
  async (params, { rejectWithValue }) => {
    try {
      const res = await bookingAPI.getMyBookings(params);
      return res.data.bookings;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchPanditBookings = createAsyncThunk(
  "bookings/fetchPandit",
  async (params, { rejectWithValue }) => {
    try {
      const res = await bookingAPI.getPanditAll(params);
      return res.data.bookings;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    updateBookingStatus: (state, action) => {
      const { bookingId, status } = action.payload;
      const b = state.bookings.find((b) => b._id === bookingId);
      if (b) b.status = status;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyBookings.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false; state.bookings = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })
      .addCase(fetchPanditBookings.pending, (state) => { state.loading = true; })
      .addCase(fetchPanditBookings.fulfilled, (state, action) => {
        state.loading = false; state.bookings = action.payload;
      })
      .addCase(fetchPanditBookings.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      });
  },
});

export const { updateBookingStatus } = bookingsSlice.actions;
export const selectBookings = (s) => s.bookings.bookings;
export const selectBookingsLoading = (s) => s.bookings.loading;

export default bookingsSlice.reducer;
