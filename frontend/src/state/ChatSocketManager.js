import { getAccessToken } from "./State.js";
import { socketBaseUrl } from "./State.js";

var ChatSocketManager = (function () {
  var instance, interval;
  var reconnectInterval = 1000; // 재연결 시도 간격 초기값
  var maxReconnectAttempts = 10; // 최대 재연결 시도 횟수
  var reconnectAttempts = 0; // 현재 재연결 시도 횟수

  function init() {
    // 실제 웹 소켓 연결을 생성하고 관리하는 로직
    const socketUrl = `${socketBaseUrl}/ws/chat/?token=${getAccessToken()}`;
    var ws = new WebSocket(socketUrl);

    ws.onopen = function () {
      console.log("ChatSocket 연결 성공");
      reconnectAttempts = 0; // 연결 성공 시 재연결 시도 횟수 초기화
      reconnectInterval = 1000; // 연결 성공 시 재연결 시도 간격 초기화
    };

    ws.onclose = function (e) {
      console.log("ChatSocket 연결 끊김, 재연결 시도:", e);
      if (reconnectAttempts < maxReconnectAttempts) {
        setTimeout(function () {
          instance = init(); // 재연결 시도
        }, reconnectInterval);
        reconnectInterval *= 2; // 재연결 시도 간격 증가
        reconnectAttempts++;
      } else {
        console.log("최대 재연결 시도 횟수 도달");
        instance = null;
      }
    };

    ws.onerror = function (err) {
      console.error("ChatSocket 에러 발생:", err);
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
    startInterval: function () {
      if (interval) clearTimeout(interval);
      const self = this;
      function scheduleNext() {
        interval = setTimeout(() => {
          instance = self.getInstance();
          scheduleNext();
        }, reconnectInterval);
      }
      scheduleNext();
    },
    endInterval: function () {
      if (interval) {
        clearTimeout(interval);
        interval = null;
      }
      if (instance) instance.close();
    },
  };
})();

export default ChatSocketManager;
