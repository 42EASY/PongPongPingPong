import Nav from "./Nav.js";
import WaitingPlayer from "../components/GameRoom/WaitingPlayer.js";
import { getAccessToken } from "../state/State.js";
import changeUrl from "../Router.js";

let socket;

export default function GameRoom(data) {
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

  let playerLength = 4;
  if (data.mode === "FINAL") playerLength = 2;
  const waitingPlayersArr = [];
  for (let i = 0; i < playerLength; i++) {
    waitingPlayersArr[i] = document.createElement("div");
    waitingPlayersArr[i].id = "waitingPlayer" + i;
    $waitingPlayers.appendChild(waitingPlayersArr[i]);
  }

  const url = `ws://0.0.0.0:8000/ws/join_room/${
    data.room_id
  }/?token=${getAccessToken()}`;
  if (!socket) socket = new WebSocket(url);

  socket.onopen = () => {
    if (data.mode === "SEMI_FINAL")
      socket.send(JSON.stringify({ action: "join_room" }));
    else if (data.mode === "FINAL")
      socket.send(
        JSON.stringify({ action: "join_final", room_id: data.room_id })
      );
  };

  socket.onmessage = (e) => {
    let res = JSON.parse(e.data);
    if (res.status === "semi_final_game_start_soon") {
      res["mode"] = "SEMI_FINAL";
      changeUrl("/game", res);
    }
    if (res.status === "final_game_start_soon") {
      res["mode"] = "FINAL";
      changeUrl("/game", res);
    }
    //todo: semi_final userlist || final userlist
    if (res.status === "") {
      let i;
      for (i = 0; i < res.list.length; i++) {
        waitingPlayersArr[i].innerHTML = WaitingPlayer(res.list[i]).innerHTML;
      }
      for (let j = i; j < playerLength; j++) {
        waitingPlayersArr[j].innerHTML = WaitingPlayer().innerHTML;
      }
    }
  };

  socket.onclose = (e) => {
    if (e.wasClean) console.log("[close] - normal");
    else console.log("[close] - abnormal");
  };

  socket.onerror = (e) => {
    console.log("[error]");
    console.log(e);
  };
}
