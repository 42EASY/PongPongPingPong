import Login from "./pages/Login.js";
import Main from "./pages/Main.js";
import Game from "./pages/Game.js";
import EndGame from "./pages/EndGame.js";
import Test from "./pages/Test.js";
import GameRoom from "./pages/GameRoom.js";
import Modal from "./components/Modal/Modal.js";
import Register from "./pages/Register.js";
import Redirect from "./components/Login/Redirect.js";

const routes = [
  { path: "/", page: Test }, //todo: Test > Login으로 변경
  { path: "/login", page: Login },
  { path: "/register", page: Register },
  { path: "/login/oauth2/code", page: Redirect },
  { path: "/main", page: Main },
  { path: "/gameroom", page: GameRoom },
  { path: "/game", page: Game },
  { path: "/endgame", page: EndGame },
];

function checkUrl(requestedUrl) {
  let match = routes.find((route) => {
    if (route.path === requestedUrl) return route;
  });
  return match;
}

export default function changeUrl(requestedUrl) {
  //화면 초기화
  const $app = document.querySelector(".App");
  $app.innerHTML = "";
  const $nav = document.querySelector(".nav");
  $nav.innerHTML = "";
  const $sidebar = document.querySelector(".sidebar");
  $sidebar.innerHTML = "";

  const match = checkUrl(requestedUrl);
  if (match === undefined) return; //todo: 404 페이지 띄우기

  const cssPath = `./src/styles${match.path}.css`;
  document.getElementById("styles").setAttribute("href", cssPath);
  if (match.page !== Redirect) history.pushState(null, null, match.path);

  if (match.page === EndGame) match.page("tournament", 1, 3);
  else match.page();
}

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
  } else if (e.target.classList.contains("moveToEndGamePageBtn")) {
    // EndGame 페이지의 버튼이 클릭된 경우
    changeUrl("/endgame");
  } else if (e.target.classList.contains("moveToGameRoomPageBtn")) {
    // GameRoom 페이지의 버튼이 클릭된 경우
    changeUrl("/gameroom");
  } else if (e.target.classList.contains("modalBtn")) {
    // GameRoom 페이지의 버튼이 클릭된 경우
    Modal("gameMode");
  }
});

window.addEventListener("popstate", () => {
  changeUrl(window.location.pathname);
});
