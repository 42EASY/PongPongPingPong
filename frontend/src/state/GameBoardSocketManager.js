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
        this.addEventListener("open", () => this.send(actionString), {
          once: true,
        });
      }
      console.log("send action~~~~", actionString);
    };

    return gs;
  }

  return {
    getInstance: function (game_id) {
      if (!instance || gameNumber !== game_id) {
        if (instance) instance.close();
        instance = init(game_id);
        gameNumber = game_id;
        return instance;
      }
    },
  };
})();

export default GameBoardSocketManager;