import { getAccessToken, socketBaseUrl } from "./State.js";
import showToast from "../components/Toast/Toast.js";
import { chatUserState } from "./ChatUserState.js";

var NotifySocketManager = (function () {
  var instance, interval;
  var reconnectInterval = 1000; // 재연결 시도 간격 초기값
  var maxReconnectAttempts = 10; // 최대 재연결 시도 횟수
  var reconnectAttempts = 0; // 현재 재연결 시도 횟수

  function init() {
    // 실제 웹 소켓 연결을 생성하고 관리하는 로직
    const socketUrl = `${socketBaseUrl}/ws/notify/?token=${getAccessToken()}`;
    var ws = new WebSocket(socketUrl);

    ws.onopen = function () {
      console.log("NotifySocket 연결 성공");
      reconnectAttempts = 0; // 연결 성공 시 재연결 시도 횟수 초기화
    };

    ws.onclose = function (e) {
      console.log("NotifySocket 연결 끊김, 재연결 시도:", e);
      if (reconnectAttempts < maxReconnectAttempts) {
        setTimeout(function () {
          instance = init(); // 재연결 시도
        }, reconnectInterval);
        reconnectInterval *= 2; // 재연결 시도 간격 증가
        reconnectAttempts++;
      } else {
        console.log("최대 재연결 시도 횟수 도달");
      }
    };

    ws.onerror = function (err) {
      console.error("NotifySocket 에러 발생:", err);
      ws.close(); // 에러 발생 시 연결을 명시적으로 닫음
    };

    ws.onmessage = function (event) {
      const data = JSON.parse(event.data);
      if (data.action === "notify_new_chat") {
        showToast("새로운 채팅이 왔습니다.");
      }
      if (data.action === "bot_notify") {
        showToast("새로운 알림이 왔습니다.");
      }
      if (data.action === "notify_chat_partner_status") {
        const userId = data.partner_id;
        const isOnline = data.is_online;
        const isBlocked = data.is_blocked;
        chatUserState.addUserState(userId, { isOnline, isBlocked });
      }
      if (data.action === "update_user_status") {
        const userId = data.user_id;
        const isOnline = data.status === "ONLINE";
        chatUserState.setUserState(userId, { isOnline: isOnline });
      }
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

export default NotifySocketManager;
