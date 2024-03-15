import { getChatContent } from "../../../state/ChatState.js";
import ChatContent from "./ChatContent.js";

export default function ChatContents(user) {
  const $chatContentsWrapper = document.createElement("div");
  $chatContentsWrapper.classList.add("chatContentsWrapper");

  const chatList = getChatContent(user.user_id);
  if (chatList !== null) {
    for (let i = 0; i < chatList.length; i++) {
      const $chat = ChatContent(user, chatList[i]);
      $chatContentsWrapper.appendChild($chat);
    }
  }
  return $chatContentsWrapper;
}
