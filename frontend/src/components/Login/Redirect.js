import { setLoginState } from "../../state/State.js";
import changeUrl from "../../Router.js";
import WebSocketManager from '../../state/WebSocketManager.js';

export default function Redirect() {
  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  const $loading = document.createElement("div");
  $loading.classList.add("loading");
  $loading.innerHTML = "로그인 중입니다...";

  $app.appendChild($loading);

  const authCode = new URL(location.href).searchParams.get("code");
  const url = "http://localhost:8000/api/v1/auth/login";

  fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "content-Type": "application/json",
    },
    body: JSON.stringify({
      code: authCode,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      const socket = WebSocketManager.getInstance();
      if (data.code === 200) {
        setLoginState(
          true,
          data.result.user_id,
          data.result.access_token,
          data.result.email,
          data.result.is_2fa,
          data.result.nickname,
          data.result.image_url
        );
        if (data.result.is_2fa === true) {
          console.log("모달"); //todo: 2차인증 모달창 띄우기
        } else changeUrl("/main");
      } else if (data.code === 201) {
        setLoginState(
          true,
          data.result.user_id,
          data.result.access_token,
          data.result.email,
          data.result.is_2fa,
          data.result.nickname,
          data.result.image_url
        );
        changeUrl("/register", true);
      }
    });
}
