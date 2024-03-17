import { getChatContent } from "../../../state/ChatState.js";
import { getUserId } from "../../../state/State.js";
import ChatContent from "./ChatContent.js";

export default function ChatContents(user, me) {
  const $chatContentsWrapper = document.createElement("div");
  $chatContentsWrapper.classList.add("chatContentsWrapper");

  const chatList = getChatContent(user.user_id);
  if (chatList !== null) {
    let $chat;
    for (let i = 0; i < chatList.length; i++) {
      if (chatList[i].id !== getUserId())
        $chat = ChatContent(user, chatList[i]);
      else $chat = ChatContent(me, chatList[i]);
      $chatContentsWrapper.appendChild($chat);
    }
  }
  return $chatContentsWrapper;
}
