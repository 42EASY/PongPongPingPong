import Title from "../components/Login/Title.js";
import LoginButton from "../components/Login/LoginButton.js";
import Register from "./Register.js";

export default function Login() {
  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  //타이틀
  const $title = Title();
  $app.appendChild($title);

  //로그인 버튼
  const $loginButton = LoginButton();
  $loginButton.onclick = () => {
    changeUrl("/register");
  };
  $app.appendChild($loginButton);

  const routes = {
    "/login": Login,
    "/register": Register,
  };

  //로그인 버튼 클릭 이벤트
  const changeUrl = (requestedUrl) => {
    history.pushState(null, null, requestedUrl);
    console.log(requestedUrl);
    routes[requestedUrl]();
  };

  window.addEventListener("popstate", () => {
    changeUrl(window.location.pathname);
  });
}
