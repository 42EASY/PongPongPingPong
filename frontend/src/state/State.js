const loginState = {
  isLogin: false,
  userId: "",
  accessToken: "",
  refreshToken: "",
  email: "",
  is2fa: false,
};

const setLoginState = (
  state,
  userId,
  accessToken,
  refreshToken,
  email,
  is2fa
) => {
  loginState.isLogin = state;
  loginState.userId = userId;
  loginState.accessToken = accessToken;
  loginState.refreshToken = refreshToken;
  loginState.email = email;
  loginState.is2fa = is2fa;
  console.log(loginState);
};

const setAccessToken = (token) => {
  loginState.accessToken = token;
};

const setIs2fa = (is2fa) => {
  loginState.is2fa = is2fa;
};

const getIsLogin = () => {
  return loginState.isLogin;
};

const getUserId = () => {
  return loginState.userId;
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
      } else {
        changeUrl("/"); //재발급 실패한 경우
      }
    });
};

export {
  setLoginState,
  setAccessToken,
  setNewAccessToken,
  setIs2fa,
  getIsLogin,
  getUserId,
  getAccessToken,
  getRefreshToken,
  getEmail,
  getIs2fa,
};
