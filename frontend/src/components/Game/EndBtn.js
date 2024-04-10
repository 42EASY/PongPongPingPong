import Chat from "../../pages/Chat.js";
import changeUrl from "../../Router.js";
import { postFriend } from "../Main/UserApi.js";

function chatting() {
  Chat();
  const $sidebar = document.querySelector(".sidebarArea");
  const $overlay = document.querySelector(".overlay");
  $sidebar.classList.add("showSidebar");
  $overlay.classList.add("showOverlay");
}

export default function EndBtn(mode, opponent, hasGameLeft) {
  const $btnWrapper = document.createElement("div");
  $btnWrapper.classList.add("btnWrapper");
  const $exitBtn = document.createElement("button");
  const $exitTxt = document.createElement("div");
  const $exitIcn = document.createElement("i");
  $exitBtn.classList.add("btn", "exit");
  $exitTxt.classList.add("btnTxt");
  $exitIcn.classList.add("bi", "bi-arrow-right");
  $exitTxt.innerHTML = "나가기";
  $exitBtn.appendChild($exitTxt);
  $exitBtn.appendChild($exitIcn);

  const $friendBtn = document.createElement("button");
  const $friendTxt = document.createElement("div");
  const $friendIcn = document.createElement("i");
  $friendBtn.classList.add("btn", "addFriend");
  $friendTxt.classList.add("btnTxt");
  $friendIcn.classList.add("bi", "bi-person-plus");
  $friendTxt.innerHTML = "친구추가";
  $friendBtn.appendChild($friendTxt);
  $friendBtn.appendChild($friendIcn);

  const $chatBtn = document.createElement("button");
  const $chatTxt = document.createElement("div");
  const $chatIcn = document.createElement("i");
  $chatBtn.classList.add("btn", "chatting");
  $chatTxt.classList.add("btnTxt");
  $chatIcn.classList.add("bi", "bi-chat-left-dots");
  $chatTxt.innerHTML = "채팅";
  $chatBtn.appendChild($chatTxt);
  $chatBtn.appendChild($chatIcn);

  if (mode === "2P") $btnWrapper.appendChild($exitBtn);
  else if (mode === "NORMAL") {
    if (opponent.relation === "NONE") $btnWrapper.appendChild($friendBtn); // block이면 안뜸
    $btnWrapper.appendChild($exitBtn);
  } else if (mode === "TOURNAMENT") {
    if (opponent.relation === "NONE") $btnWrapper.appendChild($friendBtn);
    $btnWrapper.appendChild(hasGameLeft ? $chatBtn : $exitBtn);
  }

  $exitBtn.addEventListener("click", () => {
    changeUrl("/main");
  });
  $friendBtn.addEventListener("click", () => {
    postFriend(opponent.user_id);
    $friendBtn.disabled = true;
  });
  $chatBtn.addEventListener("click", () => {
    chatting();
  });

  return $btnWrapper;
}
