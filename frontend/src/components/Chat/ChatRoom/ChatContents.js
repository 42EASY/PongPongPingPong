import ChatContent from "./ChatContent.js";

export default function ChatContents() {
  const $chatContentsWrapper = document.createElement("div");
  $chatContentsWrapper.classList.add("chatContentsWrapper");

  const $chat = ChatContent();
  $chatContentsWrapper.appendChild($chat);
  const $chat2 = ChatContent();
  $chatContentsWrapper.appendChild($chat2);

  return $chatContentsWrapper;
}
