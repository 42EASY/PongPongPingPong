import Title from "../components/Friends/Title.js";

export default function Friends() {
  const $app = document.querySelector(".App");
  $app.innerHTML = ""; //추후 수정 필요할 수 있음

  //전체 영역
  const $friendsWrapper = document.createElement("div");
  $friendsWrapper.classList.add("friendsWrapper");

  //타이틀
  const $title = Title();
  $friendsWrapper.appendChild($title);

  $app.appendChild($friendsWrapper);
}
