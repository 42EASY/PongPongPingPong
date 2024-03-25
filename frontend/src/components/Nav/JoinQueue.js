import changeUrl from "../../Router.js";
import { getAccessToken } from "../../state/State.js";

const url = `ws://0.0.0.0:8000/ws/join_queue/?token=${getAccessToken()}`;
const socket = new WebSocket(url);

socket.onopen = () => {
  console.log("[open]");
};

socket.onclose = (e) => {
  if (e.wasClean) console.log("[close] - normal");
  else console.log("[close] - abnormal");
};

socket.onerror = (e) => {
  console.log("[error]");
  console.log(e);
};

export function joinNormalQueue(data) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
    socket.onmessage = (e) => {
      let res = JSON.parse(e.data);
      if (res.status === "game create success") {
        //todo: chat game_id
      }
      if (res.status === "game_start_soon") {
        res[mode] = data.game_mode;
        res[option] = "NORMAL";
        changeUrl("/game", res);
      }
    };
  }
}

export function cancelNormalQueue(data) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
    socket.onmessage = (e) => {
      console.log(JSON.parse(e.data));
    };
  }
}

export function joinTournamentQueue(data) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
    socket.onmessage = (e) => {
      let res = JSON.parse(e.data);
      if (res.status === "game create success") {
        //todo: chat room_id
      }
      if (res.status === "success") {
        changeUrl("/gameroom", res);
      }
    };
  }
}
