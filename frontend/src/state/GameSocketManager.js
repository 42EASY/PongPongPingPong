import { getAccessToken } from "./State.js";

var GameSocketManager = (function () {
  var instance;
  var reconnectInterval = 1000;
  var maxReconnectAttempts = 5;
  var reconnectAttempts = 0;

  function init(game_id) {
    const socketUrl = `ws://localhost:8000/ws/game/${game_id}/?token=${getAccessToken()}`;
    var gs = new WebSocket(socketUrl);

    gs.onopen = function () {
      console.log("GameSocket 연결 성공");
      reconnectAttempts = 0;
    };

    gs.onclose = function (e) {
      console.log("GameSocket 연결 끊김, 재연결 시도:", e);
      if (reconnectAttempts < maxReconnectAttempts) {
        setTimeout(function () {
          instance = init(game_id);
        }, reconnectInterval);
        reconnectInterval *= 2;
        reconnectAttempts++;
      } else {
        console.log("최대 재연결 시도 횟수 도달");
      }
    };

    gs.onerror = function (err) {
      console.error("GameSocket 에러 발생:", err);
      gs.close();
    };

    gs.sendAction = function (action) {
      const actionString = JSON.stringify(action);
      if (this.readyState === WebSocket.OPEN) {
        this.send(actionString);
      } else {
        this.addEventListener("open", () => this.send(actionString), {
          once: true,
        });
      }
      console.log("send action success~~~~~~~~~~~~~~~~~~~~~", actionString);
    };

    return gs;
  }

  return {
    getInstance: function (game_id) {
      if (!instance) {
        instance = init(game_id);
      }
      return instance;
    },
  };
})();

export default GameSocketManager;
