import Title from "../components/Login/Title.js";
import LoginButton from "../components/Login/LoginButton.js";
import Register from "./Register.js";
import changeUrl from "../Router.js";

export default function Login() {
  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  //타이틀
  const $title = Title();
  $app.appendChild($title);

  //로그인 버튼
  const $loginButton = LoginButton();
  $loginButton.addEventListener("click", () => {
    changeUrl("/register");
  });
  $app.appendChild($loginButton);
}
