import Title from "../components/Chat/ChatRoom/Title.js";
import Messages from "../components/Chat/ChatRoom/ChatContents.js";
import ChatContent from "../components/Chat/ChatRoom/ChatContent.js";
import ChatInput from "../components/Chat/ChatRoom/ChatInput.js";
import { getMyInfo } from "../state/State.js";
import WebSocketManager from '../state/WebSocketManager.js';

const socket = WebSocketManager.getInstance();

function createRoomName(meId, userId) {
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

  // TODO: 로컬과 서버 시간 맞추기
  const data = {
    sender_id: me.user_id,
    receiver_id: user.user_id,
    message: $chatInput.value,
    timestamp: new Date().toISOString(),
  };

  const messageToSend = JSON.stringify({
    action: "send_message",
    ...data,
  });
  socket.send(messageToSend);

  socket.send(JSON.stringify({
    action: "update_read_time",
    room_name: roomName,
  }))

  $chatContents.appendChild(ChatContent(me, data));
  $chatInput.value = "";
}

async function receiveMessage(user, data, roomName) {
  const $chatContents = document.querySelector("#chatContents");

  $chatContents.appendChild(ChatContent(user, data));
  socket.send(JSON.stringify({
    action: "update_read_time",
    room_name: roomName,
  }))
}

async function fetchMessages(list) {
  const $chatContentsWrapper = document.querySelector(".chatContentsWrapper");

  const $list = await Messages(list);
  $chatContentsWrapper.appendChild($list);
}

export default function ChatRoom(user) {
  const $chatsWrapper = document.querySelector(".sidebarArea");
  $chatsWrapper.innerHTML = "";

  const me = getMyInfo();
  console.log(me);
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

  socket.send(JSON.stringify({ 
    action: "fetch_messages",
    room_name: roomName,
  }))

  socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log("onmessage");
    if (data.action === "fetch_messages") {
      const messages = data.messages;
      console.log(messages);
      fetchMessages(messages);
    } else if (data.action === "receive_message") {
      receiveMessage(user, data, roomName);
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
}
