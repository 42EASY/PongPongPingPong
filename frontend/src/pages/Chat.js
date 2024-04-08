import Title from "../components/Chat/Title.js";
import ChatSocketManager from "../state/ChatSocketManager.js";
import ChatRoom from "../components/Chat/Chat.js";
import NoChat from "../components/Chat/NoChat.js";
import Bot from "../components/Chat/Bot.js";
import { createRoomName } from "./ChatRoom.js"

function fetchChats(data) {
  const $chatRoomListWrapper = document.querySelector(".chatRoomListWrapper");

  const len = data.length;

  if (len === 0) {
    const $noChat = NoChat();
    $chatRoomListWrapper.appendChild($noChat);
  } else {
    for (let i = 0; i < len; i++) {
      const user = data[i].user_info;
      const cnt = data[i].unread_messages_count;
      const roomName = data[i].room_name;
      const $chat = ChatRoom(user, cnt, roomName);
      $chatRoomListWrapper.appendChild($chat);
    }
  }
}

function updateUnreadMessageCount(user, roomName) {
  // 채팅방 요소 선택
  const chatRoomElement = document.querySelector(`[roomName="${roomName}"]`);
  if (chatRoomElement) {
    const unreadCountElement = chatRoomElement.querySelector('.chatStatus');
    if (unreadCountElement) {
      let currentCount = parseInt(unreadCountElement.textContent, 10) || 0;
      unreadCountElement.textContent = currentCount + 1; // 안 읽은 메시지 수 증가
    }
  } else {
    // 채팅방이 존재하지 않는 경우, 새로운 채팅방을 생성하여 추가
    const $chatRoomListWrapper = document.querySelector(".chatRoomListWrapper");
    const $chat = ChatRoom(user, 1, roomName); // 새 채팅방 생성
    $chatRoomListWrapper.appendChild($chat); // 채팅방 목록에 추가
  }
}

export default function Chat() {
  const $sidebar = document.querySelector(".sidebar");
  $sidebar.innerHTML = "";

  const socket = ChatSocketManager.getInstance();

  //사이드바 영역
  const $chatsWrapper = document.createElement("div");
  $chatsWrapper.classList.add("sidebarArea");
  $sidebar.appendChild($chatsWrapper);

  const $titleBox = document.createElement("div");
  $titleBox.classList.add("titleBox");
  $chatsWrapper.appendChild($titleBox);

  //타이틀
  const $title = Title();
  $titleBox.appendChild($title);

  //채팅 목록
  let $chatRoomListWrapper = document.createElement("div");
  $chatRoomListWrapper.classList.add("chatRoomListWrapper");
  $chatsWrapper.appendChild($chatRoomListWrapper);

  // todo: bot 위치 수정
  $chatRoomListWrapper.appendChild(Bot(0));

  socket.send(JSON.stringify({ action: "fetch_chat_list" }));

  socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    if (data.action === "fetch_chat_list") {
      const list = data.data;
      fetchChats(list);
    } 
    if (data.action === "receive_message") {
      const sender = data.sender;
      const receiver = data.receiver;
      const roomName = createRoomName(receiver.user_id, sender.user_id);

      updateUnreadMessageCount(sender, roomName);
    }
  };

  //사이드바 외부 영역
  const $overlay = document.createElement("div");
  $overlay.classList.add("overlay");

  $overlay.addEventListener("click", (e) => {
    $chatsWrapper.classList.remove("showSidebar");
    $overlay.classList.remove("showOverlay");
  });
  $sidebar.appendChild($overlay);
}
