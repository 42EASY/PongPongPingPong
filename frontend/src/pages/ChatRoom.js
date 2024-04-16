import Title from "../components/Chat/ChatRoom/Title.js";
import ChatContent from "../components/Chat/ChatRoom/ChatContent.js";
import ChatInput from "../components/Chat/ChatRoom/ChatInput.js";
import { getMyInfo } from "../state/State.js";
import ChatSocketManager from "../state/ChatSocketManager.js";
import { chatUserState } from "../state/ChatUserState.js";
import Modal from "../components/Modal/Modal.js";
import { getTimestamp } from "../state/ChatState.js";

const socket = ChatSocketManager.getInstance();

export function createRoomName(meId, userId) {
  const roomName = `chat_${Math.min(meId, userId)}_${Math.max(meId, userId)}`;
  return roomName;
}

async function sendMessage(user, me, roomName) {
  const $chatInput = document.querySelector(".chatInput");
  const $chatContents = document.querySelector("#chatContents");

  // 입력 필드가 비어 있으면 함수 실행을 중단
  if ($chatInput.value.trim() === "") {
    return;
  }

  // 사용자 상태 확인
  const userStatus = chatUserState.getUserState()[user.user_id];
  if (userStatus) {
    // isBlocked가 true이거나 isOnline이 false일 경우 메시지 전송 방지
    if (!userStatus.isOnline) {
      Modal("chatFail_offlineUser");
      $chatInput.blur();
      return;
    } else if (userStatus.isBlocked) {
      Modal("chatFail_blockedUser");
      $chatInput.blur();
      return;
    }
  }

  const data = {
    sender_id: me.user_id,
    receiver_id: user.user_id,
    message: $chatInput.value,
    timestamp: getTimestamp(),
  };

  const messageToSend = JSON.stringify({
    action: "send_message",
    ...data,
  });
  socket.send(messageToSend);

  socket.send(
    JSON.stringify({
      action: "update_read_time",
      room_name: roomName,
      timestamp: getTimestamp(),
    })
  );

  $chatContents.appendChild(ChatContent(me, data));
  $chatInput.value = "";
}

async function receiveMessage(user, data, roomName) {
  if (data.sender.user_id !== user.user_id) return;
  const $chatContents = document.querySelector("#chatContents");

  $chatContents.appendChild(ChatContent(user, data));
  socket.send(
    JSON.stringify({
      action: "update_read_time",
      room_name: roomName,
      timestamp: getTimestamp(),
    })
  );
}

function fetchMessages(list) {
  const $chatContentsWrapper = document.querySelector(".chatContentsWrapper");

  for (const message of list) {
    const $chat = ChatContent(message.sender, message);
    $chatContentsWrapper.appendChild($chat);
  }
}

export default function ChatRoom(user) {
  const $chatsWrapper = document.querySelector(".sidebarArea");
  $chatsWrapper.innerHTML = "";

  const me = getMyInfo();
  const roomName = createRoomName(me.user_id, user.user_id);

  //타이틀
  const $titleBox = document.createElement("div");
  $titleBox.classList.add("titleBox");
  $chatsWrapper.appendChild($titleBox);

  const $title = Title(user);
  $titleBox.appendChild($title);

  // 이전 채팅 내용 받아오기
  const $chatContentsWrapper = document.createElement("div");
  $chatContentsWrapper.classList.add("chatContentsWrapper");
  $chatContentsWrapper.id = "chatContents";
  $chatsWrapper.appendChild($chatContentsWrapper);

  socket.send(
    JSON.stringify({
      action: "enter_chat_room",
      room_name: roomName,
      timestamp: getTimestamp(),
    })
  );

  socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    console.log(data);

    if (data.action === "fetch_messages") {
      const messages = data.messages;
      fetchMessages(messages);
      $chatsWrapper.scrollTop = $chatsWrapper.scrollHeight;
    } else if (data.action === "receive_message") {
      receiveMessage(user, data, roomName);
      $chatsWrapper.scrollTop = $chatsWrapper.scrollHeight;
    } else if (data.action === "notify_chat_partner_status") {
      const userId = data.partner_id;
      const isOnline = data.is_online;
      const isBlocked = data.is_blocked;
      chatUserState.addUserState(userId, { isOnline, isBlocked });
    } else if (data.action === "update_user_status") {
      const userId = data.user_id;
      const isOnline = data.status === "ONLINE";
      chatUserState.setUserState(userId, { isOnline: isOnline });
    }

    if (data.status === "fail") {
      if (data.type === "blocked_chat_user") {
        Modal("chatFail_blockedUser");
        chatUserState.setUserState(user.user_id, { isBlocked: true });
      } else if (data.type === "offline_chat_user")
        Modal("chatFail_offlineUser");
      chatUserState.setUserState(user.user_id, { isOnline: false });
    }
  };

  //채팅 입력칸
  const $chatInputBox = ChatInput();
  $chatsWrapper.appendChild($chatInputBox);

  //채팅 전송 버튼 클릭 시 이벤트
  const $chatSubmit = document.querySelector(".chatSubmit");
  $chatSubmit.addEventListener("click", () => {
    sendMessage(user, me, roomName);
    $chatsWrapper.scrollTop = $chatsWrapper.scrollHeight;
  });

  //채팅 전송 엔터 입력 시 이벤트
  const $chatInput = document.querySelector(".chatInput");
  $chatInput.focus();
  $chatInput.addEventListener("keyup", (e) => {
    if (e.keyCode === 13 && $chatInput.value.trim() !== "") {
      sendMessage(user, me, roomName);
      $chatsWrapper.scrollTop = $chatsWrapper.scrollHeight;
    }
  });

  window.onload = function () {
    document.body.style.display = "block";
  };
}
