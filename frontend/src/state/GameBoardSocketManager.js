import { getAccessToken, socketBaseUrl } from "./State.js";

var GameBoardSocketManager = (function () {
  let instance;
  let gameNumber;

  function init(game_id) {
    gameNumber = game_id;
    const socketUrl = `${socketBaseUrl}/ws/game-board/${gameNumber}/?token=${getAccessToken()}`;
    var gs = new WebSocket(socketUrl);

    gs.onopen = function () {
      console.log("[game - open]");
    };

    gs.onclose = (e) => {
      if (e.wasClean) console.log("[game - close] - normal");
      else console.log("[game - close] - abnormal");
    };

    gs.onerror = function (err) {
      console.error("[game - error]", err);
      gs.close();
    };

    gs.sendAction = function (action) {
      const actionString = JSON.stringify(action);
      if (this.readyState === WebSocket.OPEN) {
        this.send(actionString);
      } else {
        console.log("Cannot send action, WebSocket is not open.");
      }
      console.log("Action sent:", actionString);
    };

    window.addEventListener("beforeunload", function () {
      console.log("Trying to leave the page");
      gs.close();
    });

    // 추가: popstate 이벤트 리스너를 초기화 함수에 포함
    window.addEventListener("popstate", function () {
      if (gs.readyState === WebSocket.OPEN) {
        gs.close();
        console.log("WebSocket connection closed due to navigation");
      }
    });

    return gs;
  }

  return {
    getInstance: function (game_id) {
      if (!instance || gameNumber !== game_id || instance.readyState === WebSocket.CLOSED || instance.readyState === WebSocket.CLOSING) {
        if (instance) {
          instance.close();
          console.log("[game - close] - instance closed due to new game init");
        }
        instance = init(game_id);
        gameNumber = game_id;
      }
      return instance;
    },
  };
})();

export default GameBoardSocketManager;
