import Title from "../components/Chats/Title.js";
import Search from "../components/Friends/Search.js";
import List from "../components/Chats/Chats.js";

export default function Chats() {
  const $sidebar = document.querySelector(".sidebar");
  //사이드바 영역
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

  $sidebar.appendChild($chatsWrapper);
  //사이드바 외부 영역
  const $overlay = document.createElement("div");
  $overlay.classList.add("overlay");

  $overlay.addEventListener("click", (e) => {
    $chatsWrapper.classList.remove("showSidebar");
    $overlay.style.display = "none";
  });
  $sidebar.appendChild($overlay);
}
