import Chat from "../../../pages/Chat.js";

export default function Title(user) {
  const $titleWrapper = document.createElement("div");
  $titleWrapper.classList.add("chatTitleWrapper");

  const $chatRoomInfo = document.createElement("div");
  $chatRoomInfo.classList.add("profileInfo");

  const $profileImg = document.createElement("img");
  $profileImg.setAttribute("src", user.image_url);
  $profileImg.setAttribute("alt", "profileImg");
  $profileImg.classList.add("profileImg");

  const $title = document.createElement("div");
  $title.classList.add("chatTitle");
  $title.innerHTML = user.nickname;

  const $closeButton = document.createElement("i");
  $closeButton.classList.add("closeButton", "bi", "bi-x-lg");

  $chatRoomInfo.appendChild($profileImg);
  $chatRoomInfo.appendChild($title);
  $titleWrapper.appendChild($chatRoomInfo);
  $titleWrapper.appendChild($closeButton);

  //채팅방 닫기 버튼 클릭 시 목록으로 돌아가기
  $closeButton.addEventListener("click", (e) => {
    Chat();
    const $sidebarArea = document.querySelector(".sidebarArea");
    const $overlay = document.querySelector(".overlay");
    $sidebarArea.classList.add("showSidebar");
    $overlay.classList.add("showOverlay");
  });

  return $titleWrapper;
}
