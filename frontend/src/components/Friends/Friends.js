import Friend from "./Friend.js";

export default function Friends() {
  const $listWrapper = document.createElement("div");
  $listWrapper.classList.add("listWrapper");

  const $friend = Friend();
  $listWrapper.appendChild($friend);

  return $listWrapper;
}
