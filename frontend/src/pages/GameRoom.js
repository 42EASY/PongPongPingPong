import Nav from "./Nav.js";
import Chat from "./Chat.js";
import Friends from "./Friends.js";
import WaitingPlayer from "../components/GameRoom/WaitingPlayer.js";

export default function GameRoom() {
  Nav();

  const $page = document.createElement("div");
  const $gameRoom = document.createElement("div");
  const $waitingPlayers = document.createElement("div");

  const waitingPlayersArr = [];
  //0 : profile, 1: empty, 2: waiting friend
  waitingPlayersArr[0] = WaitingPlayer(0);
  waitingPlayersArr[1] = WaitingPlayer(2);
  waitingPlayersArr[2] = WaitingPlayer(1);
  waitingPlayersArr[3] = WaitingPlayer(2);

  $page.appendChild($gameRoom);
  $gameRoom.id = "gameRoom";
  $gameRoom.appendChild($waitingPlayers);
  $waitingPlayers.id = "waitingPlayers";
  for (let i = 0; i < 4; i++) {
    waitingPlayersArr[i].id = "waitingPlayer" + i;
    $waitingPlayers.appendChild(waitingPlayersArr[i]);
  }
  document.querySelector(".App").innerHTML = $page.innerHTML;
}
