import Chat from "../../pages/Chat.js";

function chatting() {
  Chat();
  const $sidebar = document.querySelector(".sidebarArea");
  const $overlay = document.querySelector(".overlay");
  $sidebar.classList.add("showSidebar");
  $overlay.classList.add("showOverlay");
}

//exit button : main으로->로그인 안해서 테스트 엌케하지..
function exit() {}

//friend button : 모달->친구추가
function friend() {}

export default function EndBtn(mode, hasGameLeft) {
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

  if (mode === "2p") $btnWrapper.appendChild($exitBtn);
  else if (mode === "normal") {
    $btnWrapper.appendChild($friendBtn);
    $btnWrapper.appendChild($exitBtn);
  } else if (mode === "tournament") {
    $btnWrapper.appendChild($friendBtn);
    $btnWrapper.appendChild(hasGameLeft ? $chatBtn : $exitBtn);
  }

  $exitBtn.addEventListener("click", () => {
    exit();
  });
  $friendBtn.addEventListener("click", () => {
    friend();
  });
  $chatBtn.addEventListener("click", () => {
    chatting();
  });

  return $btnWrapper;
}
