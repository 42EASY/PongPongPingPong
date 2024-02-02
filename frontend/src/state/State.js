const loginState = {
  isLogin: false,
  token: "",
  email: "",
  is2fa: false,
};

const setLoginState = (state, token) => {
  loginState.isLogin = state;
  loginState.token = token;
};

const getIsLogin = () => {
  return loginState.isLogin;
};

const getToken = () => {
  return loginState.token;
};

export { setLoginState, getIsLogin, getToken };
