export default function Title() {
  const $titleWrapper = document.createElement("div");
  $titleWrapper.classList.add("chatTitleWrapper");

  const $title = document.createElement("div");
  $title.classList.add("chatTitle");
  $title.innerHTML = "채팅 목록";

  const $closeButton = document.createElement("i");
  $closeButton.classList.add("closeButton", "bi", "bi-x-lg");

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
