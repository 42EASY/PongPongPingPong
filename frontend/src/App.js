import Login from "./pages/Login.js";
import Main from "./pages/Main.js";
import Game from "./pages/Game.js";
import EndGame from "./pages/EndGame.js";
import Test from "./pages/Test.js";
import GameRoom from "./pages/GameRoom.js";

const $app = document.querySelector(".App");
let currentComponent = Login;

const routes = {
  "/": Test,
  "/login": Login,
  "/main": Main, //임의,,
  "/game": Game, //임의,,
  "/endgame" : EndGame,
  "/gameroom": GameRoom,
};

$app.innerHTML = routes["/"]();

export const changeUrl = (requestedUrl) => {
  const path = `./src/styles${requestedUrl}.css`;
  document.getElementById("styles").setAttribute("href", path);
  history.pushState(null, null, window.location.pathname);
  currentComponent = routes[requestedUrl];
  if (currentComponent === EndGame)
    currentComponent("tournament", 1, 3);
  else
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
  } else if (e.target.classList.contains("moveToEndGamePageBtn")) {
    // EndGame 페이지의 버튼이 클릭된 경우
    changeUrl("/endgame");
  } else if (e.target.classList.contains("moveToGameRoomPageBtn")) {
    // GameRoom 페이지의 버튼이 클릭된 경우
    changeUrl("/gameroom");
  }
});

window.addEventListener("popstate", () => {
  changeUrl(window.location.pathname);
});
