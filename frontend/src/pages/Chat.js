import Title from "../components/Chat/Title.js";
import Search from "../components/Friends/Search.js";
import List from "../components/Chat/ChatList.js";

export default function Chat() {
  const $sidebar = document.querySelector(".sidebar");
  $sidebar.innerHTML = "";

  //사이드바 영역
  const $chatsWrapper = document.createElement("div");
  $chatsWrapper.classList.add("sidebarArea");

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
    $overlay.classList.remove("showOverlay");
  });
  $sidebar.appendChild($overlay);
}
