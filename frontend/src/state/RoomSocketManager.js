import { getAccessToken, socketBaseUrl } from "./State.js";

const RoomSocketManager = (() => {
  let instance;
  let roomNumber;
  let reconnectInterval = 1000; // 재연결 시도 간격 초기값
  let maxReconnectAttempts = 10; // 최대 재연결 시도 횟수
  let reconnectAttempts = 0; // 현재 재연결 시도 횟수

  function init(room_id) {
    roomNumber = room_id;
    const socketUrl = `${socketBaseUrl}/ws/join_room/${room_id}/?token=${getAccessToken()}`;
    const ws = new WebSocket(socketUrl);

    ws.onclose = (e) => {
      if (e.wasClean) console.log("[roomgame - close] - normal");
      else {
        console.log("[roomgame - close] - abnormal");
        console.log("roomWebSocket 연결 끊김, 재연결 시도:", e);
        if (reconnectAttempts < maxReconnectAttempts) {
          setTimeout(function () {
            instance = init(); // 재연결 시도
          }, reconnectInterval);
          reconnectInterval *= 2; // 재연결 시도 간격 증가
          reconnectAttempts++;
        } else {
          console.log("최대 재연결 시도 횟수 도달");
        }
      }
    };

    ws.onerror = (e) => {
      console.log("[gameroom - error]: ", e);
      ws.close();
    };

    window.addEventListener("beforeunload", function () {
      console.log("Trying to leave the page");
      ws.close();
    });

    // 추가: popstate 이벤트 리스너를 초기화 함수에 포함
    window.addEventListener("popstate", function () {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
        console.log("WebSocket connection closed due to navigation");
      }
    });

    return ws;
  }

  return {
    getInstance: function (room_id) {
      if (room_id === undefined) return instance;
      if (!instance || instance.readyState === WebSocket.CLOSED || instance.readyState === WebSocket.CLOSING) {
        instance = init(room_id);
      } else if (roomNumber !== room_id) {
        instance.close();
        instance = init(room_id);
      }
      return instance;
    },
    close: function () {
      if (instance) instance.close();
    },
  };
})();

export default RoomSocketManager;
