import { createSlice } from "@reduxjs/toolkit";

export const splashSlice = createSlice({
  name: "splash",
  initialState: {
    value: true,
  },
  reducers: {
    offSplash: (state) => {
      state.value = false;
    },
  },
});

export const { offSplash } = splashSlice.actions;

export default splashSlice.reducer;
