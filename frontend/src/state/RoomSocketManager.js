import { getAccessToken } from "./State.js";

const RoomSocketManager = (() => {
  let instance;
  let roomNumber;

  function init(room_id) {
    roomNumber = room_id;
    const socketUrl = `ws://localhost:8000/ws/join_room/${room_id}/?token=${getAccessToken()}`;
    const ws = new WebSocket(socketUrl);

    ws.onclose = (e) => {
      if (e.wasClean) console.log("[gameroom - close] - normal");
      else console.log("[gameroom - close] - abnormal");
    };

    ws.onerror = (e) => {
      console.log("[gameroom - error]");
      console.log(e);
    };

    return ws;
  }

  return {
    getInstance: function (room_id) {
      if (room_id === undefined) return instance;
      if (!instance) {
        instance = init(room_id);
      } else if (roomNumber !== room_id) {
        instance.close();
        instance = init(room_id);
      }
      return instance;
    },
  };
})();

export default RoomSocketManager;
