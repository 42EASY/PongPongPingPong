const loginState = {
  isLogin: false,
  token: "",
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
