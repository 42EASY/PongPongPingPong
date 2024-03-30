import ChatContent from "./ChatContent.js";

export default async function ChatContents(messages) {
  const $chatContentsWrapper = document.createElement("div");

  for (const message of messages) {
    const $chat = ChatContent(message.sender, message);
    $chatContentsWrapper.appendChild($chat);
  }

  return $chatContentsWrapper;
}
