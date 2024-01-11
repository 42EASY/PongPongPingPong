import WaitingPlayer from "../components/GameRoom/WaitingPlayer.js";

export default function GameRoom() {
  const $page = document.createElement("div");
  const $gameRoom = document.createElement("div");
  const $waitingPlayers = document.createElement("div");

  const waitingPlayersArr = [];
  waitingPlayersArr[0] = WaitingPlayer(false);
  waitingPlayersArr[1] = WaitingPlayer(false);
  waitingPlayersArr[2] = WaitingPlayer(true);
  waitingPlayersArr[3] = WaitingPlayer(true);

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
