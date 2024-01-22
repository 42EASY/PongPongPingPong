export default function Title() {
  const $titleWrapper = document.createElement("div");
  $titleWrapper.classList.add("titleWrapper");

  const $title = document.createElement("div");
  $title.classList.add("title");

  const $closeButton = document.createElement("i");
  $closeButton.classList.add("closeButton", "bi", "bi-x-lg");

  const $friendsList = document.createElement("div");
  //초기 화면에서는 친구 목록 선택
  $friendsList.classList.add("friendList", "titleList", "titleSelect");
  $friendsList.innerHTML = "친구 목록";

  const $blockedList = document.createElement("div");
  $blockedList.classList.add("blockedList", "titleList");
  $blockedList.innerHTML = "차단 목록";

  $title.appendChild($friendsList);
  $title.appendChild($blockedList);

  $titleWrapper.appendChild($title);
  $titleWrapper.appendChild($closeButton);

  return $titleWrapper;
}
