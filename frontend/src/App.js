import Login from "./pages/Login.js";
import Main from "./pages/Main.js";
import Game from "./pages/Game.js";
import Test from "./pages/Test.js";

const $app = document.querySelector(".App");
let currentComponent = Login;

const routes = {
  "/": Test,
  "/login": Login,
  "/main": Main, //임의,,
  "/game": Game, //임의,,
};

$app.innerHTML = routes["/"]();

export const changeUrl = (requestedUrl) => {
  history.pushState(null, null, requestedUrl);
  currentComponent = routes[requestedUrl];
  currentComponent();
};

window.addEventListener("click", (e) => {
  if (e.target.classList.contains("moveToLoginPageBtn")) {
    // Login 페이지의 버튼이 클릭된 경우
    changeUrl("/login");
  } else if (e.target.classList.contains("moveToMainPageBtn")) {
    // Main 페이지의 버튼이 클릭된 경우
    changeUrl("/main");
  } else if (e.target.classList.contains("moveToGamePageBtn")) {
    // Game 페이지의 버튼이 클릭된 경우
    changeUrl("/game");
  }
});

window.addEventListener("popstate", () => {
  changeUrl(window.location.pathname);
});
