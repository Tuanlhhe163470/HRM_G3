import http from "../../lib/axiosClient"
import { apiLogin, apiLogout } from "./urls"

const login = payload => http.post(apiLogin, payload)
const logout = () => http.get(apiLogout)
const AuthService = {
  login,
  logout,
}
export default AuthService

