import { createSlice } from '@reduxjs/toolkit'

export const visibilitySlice = createSlice({
  name: 'visibility',
  initialState: { visible: true },
  reducers: {
    setVisibility: (state, action) => {
      state.visible = action.payload
    }
  }
})

export const { setVisibility } = visibilitySlice.actions
export default visibilitySlice.reducer
