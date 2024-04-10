import { setLoginState } from "../../state/State.js";
import changeUrl from "../../Router.js";
import WebSocketManager from "../../state/WebSocketManager.js";
import { call2faOtpModal } from "../Register/TwoFactorAuth.js";
import Modal from "../Modal/Modal.js";
import JoinSocketManager from "../../state/JoinSocketManager.js";
import { baseUrl } from "../../state/State.js";

export default function Redirect() {
  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  const $loading = document.createElement("div");
  $loading.classList.add("loading");
  $loading.innerHTML = "로그인 중입니다...";

  $app.appendChild($loading);

  const authCode = new URL(location.href).searchParams.get("code");
  const url = `${baseUrl}/api/v1/auth/login`;

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
      WebSocketManager.getInstance();
      JoinSocketManager.getInstance();
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
          call2faOtpModal().then((result) => {
            if (result === true) {
              changeUrl("/main");
            } else changeUrl("/");
          });
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

function login2fa() {
  Modal("otp").then(async (result) => {
    if (result.isPositive === true) {
      const status = await call2faOtqApi(result.input);
      console.log(status);
      if (status === true) {
        console.log("2차 인증 성공");
        changeUrl("/main");
        return;
      } else if (status === false) {
        console.log("2차 인증 실패");
        return;
      }
    }
  });
}
