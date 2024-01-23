import Title from "../components/Chat/ChatRoom/Title.js";
import ChatContents from "../components/Chat/ChatRoom/ChatContents.js";
import ChatInput from "../components/Chat/ChatRoom/ChatInput.js";

export default function ChatRoom() {
  const $chatsWrapper = document.querySelector(".sidebarArea");
  $chatsWrapper.innerHTML = "";

  //타이틀
  const $title = Title();
  $chatsWrapper.appendChild($title);

  //채팅 내용
  const $chatContents = ChatContents();
  $chatsWrapper.appendChild($chatContents);

  //채팅 입력칸
  const $chatInput = ChatInput();
  $chatsWrapper.appendChild($chatInput);
}
