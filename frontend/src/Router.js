import Login from "./pages/Login.js";
import Main from "./pages/Main.js";
import Game from "./pages/Game.js";
import EndGame from "./pages/EndGame.js";
import GameRoom from "./pages/GameRoom.js";
import Register from "./pages/Register.js";
import Redirect from "./components/Login/Redirect.js";
import NotFound from "./pages/NotFound.js";
import { getUserId, getIsLogin } from "./state/State.js";

const routes = [
  { path: "/", page: Login, style: "login" },
  { path: "/register", page: Register, style: "register" },
  { path: "/login/oauth2/code", page: Redirect, style: "redirect" },
  { path: "/main", page: Main, style: "main" },
  { path: "/gameroom", page: GameRoom, style: "gameroom" },
  { path: "/game", page: Game, style: "game" },
  { path: "/endgame", page: EndGame, style: "endgame" },
  { path: "/404", page: NotFound, style: "notfound" },
];

function checkUrl(requestedUrl) {
  let findUrl = requestedUrl;
  if (requestedUrl.startsWith("/main")) findUrl = "/main";
  let match = routes.find((route) => {
    if (route.path === findUrl) return route;
  });
  if (match === undefined) return match;
  const copy = { ...match };
  if (requestedUrl.startsWith("/main")) {
    const segPath = requestedUrl.split("=").filter(Boolean);
    if (segPath.length === 2 && segPath[1] !== getUserId())
      copy.path = requestedUrl;
  }
  return copy;
}

export default function changeUrl(requestedUrl, element) {
  //화면 초기화
  document.body.style.display = "none";
  const $app = document.querySelector(".App");
  $app.innerHTML = "";
  const $nav = document.querySelector(".nav");
  $nav.innerHTML = "";
  const $sidebar = document.querySelector(".sidebar");
  $sidebar.innerHTML = "";

  const match = checkUrl(requestedUrl);
  if (match === undefined) changeUrl("/404");

  const cssPath = `/src/styles/${match.style}.css`;
  document.getElementById("styles").setAttribute("href", cssPath);

  if (match.page !== Redirect) history.pushState(null, null, match.path);

  // if (match.page === EndGame) match.page("tournament", 1, 3, 1);

  if (
    match.page === Main ||
    match.page === Register ||
    match.page === GameRoom ||
    match.page === Game ||
    match.page === EndGame
  ) {
    if (getIsLogin() === null) {
      changeUrl("/"); //로그인하지 않은 경우 로그인 페이지로 이동
      return;
    }
  }

  if (match.page === Register) match.page(element);
  if (
    match.page === GameRoom ||
    match.page === Game ||
    match.page === EndGame
  ) {
    if (element) match.page(element);
    else changeUrl("/main");
  } else match.page();
}

window.addEventListener("popstate", () => {
  changeUrl(window.location.pathname);
});
