import ChatRoom from "../../pages/ChatRoom.js";
import { delChatContent } from "../../state/ChatState.js";
import Modal from "../Modal/Modal.js";
import ChatSocketManager from "../../state/ChatSocketManager.js";

export default function Chat(user, cnt) {
  const socket = ChatSocketManager.getInstance();
  
  const $chatWrapper = document.createElement("div");
  $chatWrapper.classList.add("chatWrapper");

  const $profileInfo = document.createElement("div");
  $profileInfo.classList.add("profileInfo");

  const $profileImg = document.createElement("img");
  $profileImg.setAttribute("src", user.image_url);
  $profileImg.setAttribute("alt", "profileImg");
  $profileImg.classList.add("profileImg");

  const $profileName = document.createElement("div");
  $profileName.classList.add("profileName");
  $profileName.innerText = user.nickname;

  //안읽은 채팅 있을 경우
  const $chatStatus = document.createElement("div");
  if (cnt !== 0) {
    $chatStatus.classList.add("chatStatus");
    $chatStatus.innerText = cnt;
  }

  const $closeButton = document.createElement("i");
  $closeButton.classList.add("closeButton", "bi", "bi-x-lg", "hide");

  //채팅방 닫기 버튼 클릭 시 이벤트
  $closeButton.addEventListener("click", () => {
    Modal("exitChatting", user.nickname).then((result) => {
      if (result.isPositive) {
        delChatContent(user.user_id);
        $chatWrapper.style.display = "none";
      }
    });
  });

  $profileInfo.appendChild($profileImg);
  $profileInfo.appendChild($profileName);

  $chatWrapper.appendChild($profileInfo);
  $chatWrapper.appendChild($chatStatus);
  $chatWrapper.appendChild($closeButton);

  //채팅방 호버 시 이벤트
  $chatWrapper.addEventListener("mouseover", () => {
    $closeButton.classList.remove("hide");
    $chatStatus.style.display = "none";
  });

  $chatWrapper.addEventListener("mouseout", () => {
    $closeButton.classList.add("hide");
    $chatStatus.style.display = "inherit";
  });

  //채팅방 더블클릭 시 이벤트
  $chatWrapper.addEventListener("click", () => {
    ChatRoom(user);
  });

  return $chatWrapper;
}
