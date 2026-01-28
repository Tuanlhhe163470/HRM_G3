import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  isAuthenticated: false,
  user: {},
  userInfo: {},
  loading: false,
  error: null,
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: state => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action) => {
      state.isAuthenticated = true
      state.user = action.payload.user
      state.userInfo = action.payload.userInfo
      state.loading = false
    },
    loginFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    logout: state => {
      state.isAuthenticated = false
      state.user = {}
      state.userInfo = {}
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout } =
  authSlice.actions

export const selectAuth = state => state.auth
export const selectIsAuthenticated = state => state.auth.isAuthenticated
export const selectUser = state => state.auth.user
export const selectUserInfo = state => state.auth.userInfo

export default authSlice.reducer
