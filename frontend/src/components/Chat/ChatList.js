import Chat from "./Chat.js";
import NoChat from "./NoChat.js";

export default async function ChatList(data) {
  const $chatListWrapper = document.createElement("div");
  $chatListWrapper.classList.add("chatListWrapper");

  const len = data.length;

  if (len === 0) {
    const $noChat = NoChat();
    $chatListWrapper.appendChild($noChat);
  } else {
    for (let i = 0; i < len; i++) {
      const user = data[i].user_info;
      const cnt = data[i].unread_messages_count;
      const $chat = Chat(user, cnt);
      $chatListWrapper.appendChild($chat);
    }
  }

  return $chatListWrapper;
}
