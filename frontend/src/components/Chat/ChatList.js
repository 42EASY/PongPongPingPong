import Chat from "./Chat.js";
import NoChat from "./NoChat.js";
import NoSearch from "../Friends/NoSearch.js";

export default function ChatList() {
  const $chatListWrapper = document.createElement("div");
  $chatListWrapper.classList.add("chatListWrapper");

  const $chat = Chat();
  $chatListWrapper.appendChild($chat);
  const $chat1 = Chat();
  $chatListWrapper.appendChild($chat1);

  //채팅 없을 경우
  //   $chatListWrapper.style.flexDirection = "unset";
  //   const $noChat = NoChat();
  //   $chatListWrapper.appendChild($noChat);

  //친구 검색 결과 없을 경우
  //   const $noSearch = NoSearch();
  //   $chatListWrapper.appendChild($noSearch);

  return $chatListWrapper;
}
