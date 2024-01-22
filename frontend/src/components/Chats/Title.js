export default function Title() {
  const $titleWrapper = document.createElement("div");
  $titleWrapper.classList.add("titleWrapper");

  const $title = document.createElement("div");
  $title.classList.add("title");
  $title.innerHTML = "채팅 목록";

  const $closeButton = document.createElement("i");
  $closeButton.classList.add("closeButton", "bi", "bi-x-lg");

  $titleWrapper.appendChild($title);
  $titleWrapper.appendChild($closeButton);

  return $titleWrapper;
}
