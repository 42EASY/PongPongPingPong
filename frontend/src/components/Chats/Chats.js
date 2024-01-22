import Chat from "./Chat.js";
import NoChat from "./NoChat.js";
import NoSearch from "../Friends/NoSearch.js";

export default function Chats() {
  const $chatsWrapper = document.createElement("div");
  $chatsWrapper.classList.add("listWrapper");

  const $chat = Chat();
  $chatsWrapper.appendChild($chat);
  const $chat1 = Chat();
  $chatsWrapper.appendChild($chat1);

  //채팅 없을 경우
  //   $chatsWrapper.style.flexDirection = "unset";
  //   const $noChat = NoChat();
  //   $chatsWrapper.appendChild($noChat);

  //친구 검색 결과 없을 경우
  //   const $noSearch = NoSearch();
  //   $chatsWrapper.appendChild($noSearch);

  return $chatsWrapper;
}
