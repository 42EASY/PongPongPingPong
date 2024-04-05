import changeUrl from "../../Router.js";
import { getAccessToken } from "../../state/State.js";

const url = `ws://localhost:8000/ws/join_queue/?token=${getAccessToken()}`;
let socket;
if (!socket) socket = new WebSocket(url);

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
      if (res.status === "game_start_soon") {
        res["mode"] = "NORMAL";
        res["option"] = data.game_mode;
        changeUrl("/game", res);
      }
    };
  }
}

export function joinInviteNormalQueue(data) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
    socket.onmessage = (e) => {
      let res = JSON.parse(e.data);
      if (res.status === "game_start_soon") {
        res["mode"] = "NORMAL";
        res["option"] = data.game_mode;
        changeUrl("/game", res);
      }
      if (res.status === "fail") return false;
    };
  }
  return false;
}

export function joinInviteTournamentQueue(data) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
    socket.onmessage = (e) => {
      let res = JSON.parse(e.data);
      if (res.status === "success") {
        res["round"] = "SEMI_FINAL";
        changeUrl("/gameroom", res);
      }
      if (res.status === "fail") return false;
    };
  }
  return false;
}

export function cancelNormalQueue(data) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}

export function joinTournamentQueue(data) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
    socket.onmessage = (e) => {
      let res = JSON.parse(e.data);
      if (res.status === "success") {
        res["round"] = "SEMI_FINAL";
        changeUrl("/gameroom", res);
      }
    };
  }
}
