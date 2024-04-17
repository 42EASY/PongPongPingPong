import Nav from "./Nav.js";
import WaitingPlayer from "../components/GameRoom/WaitingPlayer.js";
import changeUrl from "../Router.js";
import Modal from "../components/Modal/Modal.js";
import RoomSocketManager from "../state/RoomSocketManager.js";
import TimerRing from "../components/GameRoom/TimerRing.js";

export default function GameRoom(data) {
  if (!data) {
    changeUrl("/main");
    return;
  }
  console.log(data);
  Nav();
  const $app = document.querySelector(".App");
  $app.innerHTML = "";
  const $gameRoom = document.createElement("div");
  $app.appendChild($gameRoom);
  $gameRoom.id = "gameRoom";
  const $waitingPlayers = document.createElement("div");
  $waitingPlayers.id = "waitingPlayers";
  $gameRoom.appendChild($waitingPlayers);

  let playerLength = 4;

  const waitingPlayersArr = [];
  if (data.round === "FINAL") {
    $waitingPlayers.id = "waitingFinalPlayers";
    const textbox1 = document.createElement("div");
    const textbox2 = document.createElement("div");
    textbox1.classList.add("waitingText");
    textbox2.classList.add("waitingText");
    textbox1.innerHTML = "상대방이 아직 게임 중입니다";
    textbox2.innerHTML = "🧽 잠시만 기다려 주세요 🧽";
    $waitingPlayers.append(textbox1);
    $waitingPlayers.append(textbox2);
    $waitingPlayers.appendChild(TimerRing());
  } else {
    for (let i = 0; i < playerLength; i++) {
      waitingPlayersArr[i] = document.createElement("div");
      waitingPlayersArr[i].id = "waitingPlayer" + i;
      $waitingPlayers.appendChild(waitingPlayersArr[i]);
    }
  }

  const socket = RoomSocketManager.getInstance(data.room_id);

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
      res["room_id"] = data.room_id;
      socket.close();
      Modal("gameStartSoon", res).then(() => {
        changeUrl("/game", res);
      });
    }
    if (res.status === "final_game_start_soon") {
      res["mode"] = "TOURNAMENT";
      res["option"] = "CLASSIC";
      res["round"] = "FINAL";
      res["room_id"] = data.room_id;
      socket.close();
      Modal("gameStartSoon", res).then(() => {
        changeUrl("/game", res);
      });
    }
    if (res.status === "player_entrance" && data.round === "SEMI_FINAL") {
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
    if (res.status === "game_over") {
      Modal("invalidGame");
      const modalTitle = document.querySelector(".modalTitle");
      modalTitle.innerHTML = "게임이 종료되었습니다";
      const modalText = document.querySelector(".modalText");
      modalText.innerHTML = "게임 상대의 연결이 끊어졌습니다";
      changeUrl("/main");
    }
  };
}
