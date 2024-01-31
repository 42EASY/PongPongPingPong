import Login from "./pages/Login.js";
import Main from "./pages/Main.js";
import Game from "./pages/Game.js";
import EndGame from "./pages/EndGame.js";
import Test from "./pages/Test.js";
import GameRoom from "./pages/GameRoom.js";
import Modal from "./components/Modal/Modal.js";
import Register from "./pages/Register.js";
import changeUrl from "./Router.js";

const $app = document.querySelector(".App");

let currentComponent = Login;

//todo: url 입력으로 넘어가지 않아야 하는 페이지 예외처리 필요
changeUrl(window.location.pathname);

// const routes = {
//   "/": Test,
//   "/login": Login,
//   "/main": Main,
//   "/game": Game,
//   "/gameroom": GameRoom,
//   "/register": Register,
// };

// $app.innerHTML = routes["/"]();

// export const changeUrl = (requestedUrl) => {
//   const path = `./src/styles${requestedUrl}.css`;
//   document.getElementById("styles").setAttribute("href", path);
//   history.pushState(null, null, requestedUrl);

//   if (routes[requestedUrl] === undefined) return; // 404 페이지 띄우기

//   currentComponent = routes[requestedUrl];
//   if (currentComponent === EndGame) currentComponent("tournament", 1, 3);
//   else currentComponent();
// };

// window.addEventListener("click", (e) => {
//   if (e.target.classList.contains("moveToLoginPageBtn")) {
//     // Login 페이지의 버튼이 클릭된 경우
//     changeUrl("/login");
//   } else if (e.target.classList.contains("moveToMainPageBtn")) {
//     // Main 페이지의 버튼이 클릭된 경우
//     changeUrl("/main");
//   } else if (e.target.classList.contains("moveToGamePageBtn")) {
//     // Game 페이지의 버튼이 클릭된 경우
//     changeUrl("/game");
//   } else if (e.target.classList.contains("moveToEndGamePageBtn")) {
//     // EndGame 페이지의 버튼이 클릭된 경우
//     changeUrl("/endgame");
//   } else if (e.target.classList.contains("moveToGameRoomPageBtn")) {
//     // GameRoom 페이지의 버튼이 클릭된 경우
//     changeUrl("/gameroom");
//   } else if (e.target.classList.contains("modalBtn")) {
//     // GameRoom 페이지의 버튼이 클릭된 경우
//     Modal("gameMode");
//   }
// });

// window.addEventListener("popstate", () => {
//   console.log("popstate");
//   changeUrl(window.location.pathname);
// });
