export default function Title() {
  const $titleWrapper = document.createElement("div");
  $titleWrapper.classList.add("friendsTitleWrapper");

  const $title = document.createElement("div");
  $title.classList.add("friendsTitle");

  const $closeButton = document.createElement("i");
  $closeButton.classList.add("closeButton", "bi", "bi-x-lg");

  const $friendsList = document.createElement("div");
  //초기 화면에서는 친구 목록 선택
  $friendsList.classList.add(
    "friendList",
    "friendsTitleList",
    "friendsTitleSelect"
  );
  $friendsList.innerHTML = "친구 목록";

  const $blockedList = document.createElement("div");
  $blockedList.classList.add("blockedList", "friendsTitleList");
  $blockedList.innerHTML = "차단 목록";

  $title.appendChild($friendsList);
  $title.appendChild($blockedList);

  $titleWrapper.appendChild($title);
  $titleWrapper.appendChild($closeButton);

  $closeButton.addEventListener("click", (e) => {
    const $sidebar = document.querySelector(".sidebarArea");
    const $overlay = document.querySelector(".overlay");
    $sidebar.classList.remove("showSidebar");
    $overlay.classList.remove("showOverlay");
  });

  return $titleWrapper;
}
