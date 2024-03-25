import Chat from "./Chat.js";
import NoChat from "./NoChat.js";
import NoSearch from "../Friends/NoSearch.js";

export default async function ChatList(data) {
  const $chatListWrapper = document.createElement("div");
  $chatListWrapper.classList.add("chatListWrapper");

  const len = data.length;
  const keyword = document.getElementById("searchInput").value;

  if (len === 0) {
    if (keyword === "") {
      $chatListWrapper.style.flexDirection = "unset";
      const $noChat = NoChat();
      $chatListWrapper.appendChild($noChat);
    } else {
      const $noSearch = NoSearch();
      $chatListWrapper.appendChild($noSearch);
    }
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
