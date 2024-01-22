import Title from "../components/Chats/Title.js";
import Search from "../components/Friends/Search.js";
import List from "../components/Chats/Chats.js";

export default function Chats() {
  const $app = document.querySelector(".App");
  $app.innerHTML = ""; //추후 수정 필요할 수 있음

  //전체 영역
  const $chatsWrapper = document.createElement("div");
  $chatsWrapper.classList.add("chatsWrapper");

  //타이틀
  const $title = Title();
  $chatsWrapper.appendChild($title);

  //검색
  const $search = Search();
  $chatsWrapper.appendChild($search);

  //채팅 목록
  const $list = List();
  $chatsWrapper.appendChild($list);

  $app.appendChild($chatsWrapper);
}
