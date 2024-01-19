export default function Title() {
  const $titleWrapper = document.createElement("div");
  $titleWrapper.classList.add("titleWrapper");

  const $title = document.createElement("div");
  $title.classList.add("title");

  const $closeButton = document.createElement("i");
  $closeButton.classList.add("closeButton", "bi", "bi-x-lg");

  const $friendsList = document.createElement("div");
  //초기 화면에서는 친구 목록 선택
  $friendsList.classList.add("titleList", "titleSelect");
  $friendsList.innerHTML = "친구 목록";

  const $blockedList = document.createElement("div");
  $blockedList.classList.add("titleList");
  $blockedList.innerHTML = "차단 목록";

  $title.appendChild($friendsList);
  $title.appendChild($blockedList);

  $titleWrapper.appendChild($title);
  $titleWrapper.appendChild($closeButton);

  //친구 목록 클릭 이벤트
  $friendsList.onclick = () => {
    $friendsList.classList.add("titleSelect");
    $blockedList.classList.remove("titleSelect");
  };

  //차단 목록 클릭 이벤트
  $blockedList.onclick = () => {
    $friendsList.classList.remove("titleSelect");
    $blockedList.classList.add("titleSelect");
  };

  return $titleWrapper;
}
