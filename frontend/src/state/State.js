//set
const setLoginState = (state, userId, accessToken, email, is2fa) => {
  localStorage.setItem("isLogin", state);
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("userId", userId);
  localStorage.setItem("email", email);
  localStorage.setItem("is2fa", is2fa);
};

const setLogoutState = () => {
  localStorage.removeItem("isLogin");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("email");
  localStorage.removeItem("is2fa");
  localStorage.removeItem("nickname");
  localStorage.removeItem("image");
};

const setIsLogin = (state) => {
  localStorage.setItem("isLogin", state);
};

const setAccessToken = (token) => {
  localStorage.setItem("accessToken", token);
};

const setIs2fa = (is2fa) => {
  localStorage.setItem("is2fa", is2fa);
};

const setNickname = (nickname) => {
  localStorage.setItem("nickname", nickname);
};

const setImage = (image) => {
  localStorage.setItem("image", image);
};

//access token 만료 시 로그인 연장 처리
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
      if (data.code === 201 || data.code === 200) {
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
  return localStorage.getItem("isLogin");
};

const getAccessToken = () => {
  return localStorage.getItem("accessToken");
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

const getNickname = () => {
  return localStorage.getItem("nickname");
};

const getImage = () => {
  return localStorage.getItem("image");
};

const getMyInfo = () => {
  return {
    user_id: getUserId(),
    nickname: getNickname(),
    image_url: getImage(),
  };
};

const logout = () => {
  const url = "http://localhost:8000/api/v1/auth/logout";

  fetch(url, {
    method: "POST",
    headers: {
      "content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      setLogoutState();
      changeUrl("/");
    });
};

export {
  setLoginState,
  setAccessToken,
  setNewAccessToken,
  setIs2fa,
  setNickname,
  setImage,
  getIsLogin,
  getUserId,
  getAccessToken,
  getEmail,
  getIs2fa,
  getNickname,
  getImage,
  getMyInfo,
  logout,
};
