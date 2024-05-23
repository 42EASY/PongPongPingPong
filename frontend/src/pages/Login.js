import LoginButton from "../components/Login/LoginButton.js";
import Title from "../components/Login/Title.js";

export default async function Login() {
  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  //타이틀
  const $title = await Title();

  //로그인 버튼
  const $loginButton = await LoginButton();

  $app.appendChild($title);
  $app.appendChild($loginButton);
}
