import { setLoginState } from "../../state/State.js";
import changeUrl from "../../Router.js";

export default function Redirect() {
  const authCode = new URL(location.href).searchParams.get("code");
  const url = "http://localhost:8000/api/v1/auth/login";
  console.log(authCode);

  fetch(url, {
    method: "POST",
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
      if (data.code === 200) {
        setLoginState(true, data.data.token);
        changeUrl("/register");
      } else if (data.code === 201) {
        setLoginState(true, data.data.token);
        changeUrl("/register");
      }
    });
}
