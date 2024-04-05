import Nav from "./Nav.js";
import WaitingPlayer from "../components/GameRoom/WaitingPlayer.js";
import { getAccessToken } from "../state/State.js";
import changeUrl from "../Router.js";
import Modal from "../components/Modal/Modal.js";

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
  if (data.round === "FINAL") playerLength = 2;
  const waitingPlayersArr = [];
  for (let i = 0; i < playerLength; i++) {
    waitingPlayersArr[i] = document.createElement("div");
    waitingPlayersArr[i].id = "waitingPlayer" + i;
    $waitingPlayers.appendChild(waitingPlayersArr[i]);
  }

  const url = `ws://localhost:8000/ws/join_room/${
    data.room_id
  }/?token=${getAccessToken()}`;
  if (!socket) socket = new WebSocket(url);

  socket.onopen = () => {
    console.log("[gameroom - open]");
    if (data.round === "SEMI_FINAL")
      socket.send(JSON.stringify({ action: "join_room" }));
    else if (data.round === "FINAL")
      socket.send(
        JSON.stringify({ action: "join_final", room_id: data.room_id })
      );
  };

  socket.onmessage = (e) => {
    let res = JSON.parse(e.data);
    console.log(res);
    if (res.status === "semi_final_game_start_soon") {
      res["mode"] = "TOURNAMENT";
      res["option"] = "CLASSIC";
      res["round"] = "SEMI_FINAL";
      Modal("tournamentTable").then(() => {
        changeUrl("/game", res);
      });
    }
    if (res.status === "final_game_start_soon") {
      res["mode"] = "TOURNAMENT";
      res["option"] = "CLASSIC";
      res["round"] = "FINAL";
      Modal("tournamentTable").then(() => {
        changeUrl("/game", res);
      });
    }

    if (res.status === "player_entrance") {
      let i;
      for (i = 0; i < res.player_info.length; i++) {
        waitingPlayersArr[i].innerHTML = "";
        waitingPlayersArr[i].appendChild(WaitingPlayer(res.player_info[i]));
      }
      for (let j = i; j < playerLength; j++) {
        waitingPlayersArr[j].innerHTML = "";
        waitingPlayersArr[j].appendChild(WaitingPlayer());
      }
    }
  };

  socket.onclose = (e) => {
    if (e.wasClean) console.log("[gameroom - close] - normal");
    else console.log("[gameroom - close] - abnormal");
  };

  socket.onerror = (e) => {
    console.log("[gameroom - error]");
    console.log(e);
  };
}
