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

const setNewAccessToken = () => {
  const url = "http://localhost:8000//api/v1/token/refresh";

  fetch(url, {
    method: "POST",
    headers: {
      "content-Type": "application/json",
      Authorization: `bearer ${getRefreshToken()}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      if (data.code === 201) {
        setAccessToken(data.result.access_token);
        return data.result.access_token;
      } else {
        changeUrl("/login"); //todo: 추후 "/"으로 변경
      }
    });
};

export {
  setLoginState,
  setAccessToken,
  setNewAccessToken,
  getIsLogin,
  getAccessToken,
  getRefreshToken,
  getEmail,
  getIs2fa,
};
