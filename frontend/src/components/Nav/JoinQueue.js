import changeUrl from "../../Router.js";
import JoinSocketManager from "../../state/JoinSocketManager.js";

export function joinNormalQueue(data) {
  const socket = JoinSocketManager.getInstance();
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
    socket.onmessage = (e) => {
      let res = JSON.parse(e.data);
      if (res.status === "game_start_soon") {
        res["mode"] = "NORMAL";
        res["option"] = data.game_mode;
        socket.close();
        changeUrl("/game", res);
      }
    };
  }
}

export function joinInviteNormalQueue(data) {
  const socket = JoinSocketManager.getInstance();
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
    socket.onmessage = (e) => {
      let res = JSON.parse(e.data);
      if (res.status === "game_start_soon") {
        res["mode"] = "NORMAL";
        res["option"] = data.game_mode;
        socket.close();
        changeUrl("/game", res);
      }
      if (res.status === "fail") return false;
    };
  }
  return false;
}

export function joinInviteTournamentQueue(data) {
  const socket = JoinSocketManager.getInstance();
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
    socket.onmessage = (e) => {
      let res = JSON.parse(e.data);
      if (res.status === "success") {
        res["round"] = "SEMI_FINAL";
        socket.close();
        changeUrl("/gameroom", res);
      }
      if (res.status === "fail") return res;
    };
  }
  return;
}

export function cancelNormalQueue(data) {
  const socket = JoinSocketManager.getInstance();
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}

export function joinTournamentQueue(data) {
  const socket = JoinSocketManager.getInstance();
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
    socket.onmessage = (e) => {
      let res = JSON.parse(e.data);
      if (res.status === "success" || res.status === "game create success") {
        res["round"] = "SEMI_FINAL";
        socket.close();
        changeUrl("/gameroom", res);
      }
    };
  }
}
