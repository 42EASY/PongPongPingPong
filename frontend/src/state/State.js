const loginState = {
  isLogin: false,
  accessToken: "",
  refreshToken: "",
  email: "",
  is2fa: false,
};

const setLoginState = (state, accessToken, refreshToken, email, is2fa) => {
  loginState.isLogin = state;
  loginState.accessToken = accessToken;
  loginState.refreshToken = refreshToken;
  loginState.email = email;
  loginState.is2fa = is2fa;
};

const setAccessToken = (token) => {
  loginState.accessToken = token;
};

const getIsLogin = () => {
  return loginState.isLogin;
};

const getAccessToken = () => {
  return loginState.accessToken;
};

const getRefreshToken = () => {
  return loginState.refreshToken;
};

const getEmail = () => {
  return loginState.email;
};

const getIs2fa = () => {
  return loginState.is2fa;
};

export {
  setLoginState,
  setAccessToken,
  getIsLogin,
  getAccessToken,
  getRefreshToken,
  getEmail,
  getIs2fa,
};
