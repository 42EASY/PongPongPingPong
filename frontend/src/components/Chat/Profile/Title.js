import ChatRoom from "../../../pages/ChatRoom.js";

export default function Title(id) {
  const $titleWrapper = document.createElement("div");
  $titleWrapper.classList.add("chatTitleWrapper");

  const $title = document.createElement("div");
  $title.classList.add("chatTitle");
  $title.innerHTML = "Profile";

  const $closeButton = document.createElement("i");
  $closeButton.classList.add("closeButton", "bi", "bi-x-lg");

  $titleWrapper.appendChild($title);
  $titleWrapper.appendChild($closeButton);

  //프로필 닫기 버튼 클릭 시 채팅방으로 돌아가기
  $closeButton.addEventListener("click", (e) => {
    ChatRoom(id);
    const $sidebarArea = document.querySelector(".sidebarArea");
    const $overlay = document.querySelector(".overlay");
    $sidebarArea.classList.add("showSidebar");
    $overlay.classList.add("showOverlay");
  });

  return $titleWrapper;
}
