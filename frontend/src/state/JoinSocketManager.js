import { getAccessToken, socketBaseUrl } from "./State.js";

const JoinSocketManager = (() => {
  let instance;
  let reconnectInterval = 1000; // 재연결 시도 간격 초기값
  let maxReconnectAttempts = 10; // 최대 재연결 시도 횟수
  let reconnectAttempts = 0; // 현재 재연결 시도 횟수
  let closeFlag = false;

  function init() {
    const socketUrl = `${socketBaseUrl}/ws/join_queue/?token=${getAccessToken()}`;
    const ws = new WebSocket(socketUrl);

    ws.onopen = () => {
      console.log("[joingame - open]");
      reconnectAttempts = 0; // 연결 성공 시 재연결 시도 횟수 초기화
    };

    ws.onclose = (e) => {
      if (e.wasClean) console.log("[joingame - close] - normal");
      else {
        console.log("[joingame - close] - abnormal");
        if (!closeFlag && reconnectAttempts < maxReconnectAttempts) {
          console.log("JoinWebSocket 연결 끊김, 재연결 시도:", e);
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
      console.log("[joingame - error]: ", e);
      ws.close();
    };

    return ws;
  }

  return {
    getInstance: function () {
      if (!instance || instance.readyState === WebSocket.CLOSED || instance.readyState === WebSocket.CLOSING) {
        if (reconnectAttempts < maxReconnectAttempts) {
          instance = init();
        }
      }
      return instance;
    },
    closeInstance: function () {
      closeFlag = true;
      if (instance) instance.close();
    },
  };
})();

export default JoinSocketManager;
