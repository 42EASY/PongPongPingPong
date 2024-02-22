import Nav from "./Nav.js";
import WaitingPlayer from "../components/GameRoom/WaitingPlayer.js";
import { getAccessToken, getUserId } from "../state/State.js";
import Modal from "../components/Modal/Modal.js";
import { startCount } from "../components/GameRoom/TimerRing.js";
import changeUrl from "../Router.js";

export default function GameRoom(tournament_id) {
  Nav();

  const $app = document.querySelector(".App");
  $app.innerHTML = "";
  const $page = document.createElement("div");
  $app.appendChild($page);
  const $gameRoom = document.createElement("div");
  $page.appendChild($gameRoom);
  $gameRoom.id = "gameRoom";
  const $waitingPlayers = document.createElement("div");
  $waitingPlayers.id = "waitingPlayers";
  $gameRoom.appendChild($waitingPlayers);

  // const url = `ws://localhost:8000/ws/join_room/${tournament_id.toString()}/?token=${getAccessToken()}`;
  // let socket = new WebSocket(url);
  // let data = {};
  // socket.onopen = () => {
  //   socket.send(JSON.stringify(data));
  // };
  // socket.onmessage = (e) => {
  //   const res = JSON.stringify(e.data);
  // };

  const waitingPlayersArr = [];
  for (let i = 0; i < 4; i++) {
    waitingPlayersArr[i] = document.createElement("div");
    waitingPlayersArr[i].id = "waitingPlayer" + i;
    $waitingPlayers.appendChild(waitingPlayersArr[i]);
  }
  //0 : profile, 1: empty, 2: waiting friend
  for (let i = 0; i < 4; i++) {
    waitingPlayersArr[i].innerHTML = "";
    if (i == 0) {
      waitingPlayersArr[i].appendChild(WaitingPlayer(0));
    } else if (i == 1) {
      waitingPlayersArr[i].appendChild(WaitingPlayer(2));
      let sec = 10;
      startCount(waitingPlayersArr[i], sec);
      setTimeout(() => {
        waitingPlayersArr[i].innerHTML = "";
        waitingPlayersArr[i].appendChild(WaitingPlayer(1));
      }, sec * 1000);
    } else {
      waitingPlayersArr[i].appendChild(WaitingPlayer(1));
    }
  }
}
