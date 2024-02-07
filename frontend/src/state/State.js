const loginState = {
  isLogin: false,
  accessToken: "",
};

//set
const setLoginState = (state, userId, accessToken, email, is2fa) => {
  loginState.isLogin = state;
  loginState.accessToken = accessToken;

  localStorage.setItem("userId", userId);
  localStorage.setItem("email", email);
  localStorage.setItem("is2fa", is2fa);
};

const setLogoutState = () => {
  loginState.isLogin = false;
  loginState.accessToken = "";

  localStorage.removeItem("userId");
  localStorage.removeItem("email");
  localStorage.removeItem("is2fa");
};

const setIsLogin = (state) => {
  loginState.isLogin = state;
};

const setAccessToken = (token) => {
  loginState.accessToken = token;
};

const setIs2fa = (is2fa) => {
  localStorage.setItem("is2fa", is2fa);
};

//새로고침 및 access token 만료 시 로그인 연장 처리
const setNewAccessToken = () => {
  const url = "http://localhost:8000/api/v1/token/refresh";

  fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      if (data.code === 201) {
        setIsLogin(true);
        setAccessToken(data.result.access_token);
      } else {
        //재발급 실패한 경우 로그아웃 처리
        logout();
        return false;
      }
    });
};

//get
const getIsLogin = () => {
  return loginState.isLogin;
};

const getAccessToken = () => {
  return loginState.accessToken;
};

const getUserId = () => {
  return localStorage.getItem("userId");
};

const getEmail = () => {
  return localStorage.getItem("email");
};

const getIs2fa = () => {
  return localStorage.getItem("is2fa");
};

const logout = () => {
  const url = "http://localhost:8000/api/v1/auth/logout";

  fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      if (data.code === 200) {
        setLogoutState();
        changeUrl("/");
      } else {
        //로그아웃 실패
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
  getEmail,
  getIs2fa,
  logout,
};
