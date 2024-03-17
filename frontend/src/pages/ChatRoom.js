import Title from "../components/Chat/ChatRoom/Title.js";
import ChatContents from "../components/Chat/ChatRoom/ChatContents.js";
import ChatContent from "../components/Chat/ChatRoom/ChatContent.js";
import ChatInput from "../components/Chat/ChatRoom/ChatInput.js";
import { getUserInfo } from "../components/Main/UserApi.js";
import { getUserId } from "../state/State.js";
import { addChatContent } from "../state/ChatState.js";

function sendMessage(id, me) {
  const $chatInput = document.querySelector(".chatInput");
  const $chatContents = document.querySelector("#chatContents");
  const data = {
    id: getUserId(),
    timestamp: new Date().toISOString(),
    message: $chatInput.value,
  };
  $chatContents.appendChild(ChatContent(me.result, data));
  addChatContent(id, data);
}

export default async function ChatRoom(id) {
  const $chatsWrapper = document.querySelector(".sidebarArea");
  $chatsWrapper.innerHTML = "";

  const user = await getUserInfo(id);
  const me = await getUserInfo(getUserId());

  //타이틀
  const $title = Title(user.result);
  $chatsWrapper.appendChild($title);

  //채팅 내용
  const $chatContents = ChatContents(user.result, me.result);
  $chatContents.id = "chatContetns";
  $chatsWrapper.appendChild($chatContents);

  //채팅 입력칸
  const $chatInputBox = ChatInput();
  $chatsWrapper.appendChild($chatInputBox);

  //채팅 전송 버튼 클릭 시 이벤트
  const $chatSubmit = document.querySelector(".chatSubmit");
  $chatSubmit.addEventListener("click", () => {
    sendMessage(id, me);
  });

  //채팅 전송 엔터 입력 시 이벤트
  const $chatInput = document.querySelector(".chatInput");
  $chatInput.focus();
  $chatInput.addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
      sendMessage(id, me);
    }
  });
}
