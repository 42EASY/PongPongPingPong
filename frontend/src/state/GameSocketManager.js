import { getAccessToken } from "./State.js";

var GameSocketManager = (function () {
  var instance = null;

  function init(game_id) {
    const socketUrl = `ws://localhost:8000/ws/game/${game_id}/?token=${getAccessToken()}`;
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
      // if (!instance) {
      instance = init(game_id);
      // }
      return instance;
    },
  };
})();

export default GameSocketManager;
