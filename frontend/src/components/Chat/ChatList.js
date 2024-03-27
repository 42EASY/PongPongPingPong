import Chat from "./Chat.js";
import NoChat from "./NoChat.js";

export default async function ChatList(data) {
  const $chatRoomListWrapper = document.createElement("div");
  $chatRoomListWrapper.classList.add("chatRoomListWrapper");

  const len = data.length;

  if (len === 0) {
    const $noChat = NoChat();
    $chatRoomListWrapper.appendChild($noChat);
  } else {
    for (let i = 0; i < len; i++) {
      const user = data[i].user_info;
      const cnt = data[i].unread_messages_count;
      const $chat = Chat(user, cnt);
      $chatRoomListWrapper.appendChild($chat);
    }
  }

  return $chatRoomListWrapper;
}
