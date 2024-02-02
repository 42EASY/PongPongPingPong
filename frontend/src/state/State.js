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
      console.log(data); //은비가 응답코드들 정리해주면 분기 필요
      // if (data.code === 200) {
      //   setLoginState(
      //     true,
      //     data.result.access_token,
      //     data.result.refresh_token,
      //     data.result.email,
      //     data.result.is2fa
      //   );
      //   if (data.result.is2fa === true) {
      //     console.log("모달"); //모달 띄우기
      //   } else changeUrl("/main");
      // } else if (data.code === 201) {
      //   setLoginState(
      //     true,
      //     data.result.access_token,
      //     data.result.refresh_token,
      //     data.result.email,
      //     data.result.is2fa
      //   );
      //   changeUrl("/register", true);
      // }
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
