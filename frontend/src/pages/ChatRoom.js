import Title from "../components/Chat/ChatRoom/Title.js";
import ChatContents from "../components/Chat/ChatRoom/ChatContents.js";
import ChatInput from "../components/Chat/ChatRoom/ChatInput.js";
import { getUserInfo } from "../components/Main/UserApi.js";

export default async function ChatRoom(id) {
  const $chatsWrapper = document.querySelector(".sidebarArea");
  $chatsWrapper.innerHTML = "";

  const user = await getUserInfo(id);

  //타이틀
  const $title = Title(user.result);
  $chatsWrapper.appendChild($title);

  //채팅 내용
  const $chatContents = ChatContents(user.result);
  $chatsWrapper.appendChild($chatContents);

  //채팅 입력칸
  const $chatInputBox = ChatInput();
  $chatsWrapper.appendChild($chatInputBox);

  //채팅 전송 버튼 클릭 시 이벤트
  const $chatSubmit = document.querySelector(".chatSubmit");
  $chatSubmit.addEventListener("click", () => {
    // todo: 메세지 보내기 - $chatInput.value
  });

  //채팅 전송 엔터 입력 시 이벤트
  const $chatInput = document.querySelector(".chatInput");
  $chatInput.focus();
  $chatInput.addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
      // todo: 메세지 보내기 - $chatInput.value
    }
  });
}
