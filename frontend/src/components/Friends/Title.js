export default function Title() {
  const $titleWrapper = document.createElement("div");
  $titleWrapper.classList.add("titleWrapper");

  const $title = document.createElement("div");
  $title.classList.add("title");

  const $closeButton = document.createElement("i");
  $closeButton.classList.add("closeButton", "bi", "bi-x-lg");

  const $friendsList = document.createElement("div");
  $friendsList.classList.add("titleList");
  $friendsList.innerHTML = "친구 목록";

  const $blockedList = document.createElement("div");
  $blockedList.classList.add("titleList");
  $blockedList.innerHTML = "차단 목록";

  $title.appendChild($friendsList);
  $title.appendChild($blockedList);

  $titleWrapper.appendChild($title);
  $titleWrapper.appendChild($closeButton);

  return $titleWrapper;
}
