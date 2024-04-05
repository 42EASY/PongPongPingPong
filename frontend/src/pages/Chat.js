import Title from "../components/Chat/Title.js";
import ChatSocketManager from "../state/ChatSocketManager.js";
import ChatRoom from "../components/Chat/Chat.js";
import NoChat from "../components/Chat/NoChat.js";
import Bot from "../components/Chat/Bot.js";

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
