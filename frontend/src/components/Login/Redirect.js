import { setLoginState } from "../../state/State.js";
import changeUrl from "../../Router.js";

export default function Redirect() {
  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  const $loading = document.createElement("div");
  $loading.classList.add("loading");
  $loading.innerHTML = "로그인 중입니다...";

  $app.appendChild($loading);

  const authCode = new URL(location.href).searchParams.get("code");
  const url = "http://localhost:443/api/v1/auth/login";
  console.log(authCode);

  //   changeUrl("/register", false);

  //   fetch(url, {
  //     method: "POST",
  //     headers: {
  //       "content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       code: authCode,
  //     }),
  //   })
  //     .then((res) => res.json())
  //     .then((data) => {
  //       console.log(data);
  //       if (data.code === 200) {
  //         setLoginState(
  //           true,
  //           data.result.access_token,
  //           data.result.refresh_token,
  //           data.result.email,
  //           data.result.is2fa
  //         );
  //         if (data.result.is2fa === true) {
  //           changeUrl("/login/2fa");
  //         } else changeUrl("/main");
  //       } else if (data.code === 201) {
  //         setLoginState(
  //           true,
  //           data.result.access_token,
  //           data.result.refresh_token,
  //           data.result.email,
  //           data.result.is2fa
  //         );
  //         changeUrl("/register", "true");
  //       }
  //     });
}
