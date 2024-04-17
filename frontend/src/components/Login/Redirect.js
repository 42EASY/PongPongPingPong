import { setLoginState } from "../../state/State.js";
import changeUrl from "../../Router.js";
import { call2faOtpModal } from "../Register/TwoFactorAuth.js";
import Modal from "../Modal/Modal.js";
import TimerRing from "../GameRoom/TimerRing.js";
import { baseUrl } from "../../state/State.js";

export default function Redirect() {
  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  const $text1 = document.createElement("div");
  $text1.classList.add("title");
  $text1.innerHTML = "🧽 로그인 중 입니다 🧽";
  const $text2 = document.createElement("div");
  $text2.classList.add("text");
  $text2.innerHTML = "잠시만 기다려 주세요!";
  const $timer = TimerRing();

  $app.appendChild($text1);
  $app.appendChild($text2);
  $app.appendChild($timer);

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
      if (status === true) {
        changeUrl("/main");
        return;
      } else if (status === false) {
        return;
      }
    }
  });
}
