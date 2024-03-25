import Title from "../components/Chat/Title.js";
import Search from "../components/Friends/Search.js";
import List from "../components/Chat/ChatList.js";

async function fetchChats(list) {
  const $wrapper = document.querySelector(".listWrapper");

  const $list = await List(list);
  $wrapper.appendChild($list);
}

export default function Chat() {
  const $sidebar = document.querySelector(".sidebar");
  $sidebar.innerHTML = "";

  //사이드바 영역
  const $chatsWrapper = document.createElement("div");
  $chatsWrapper.classList.add("sidebarArea");
  $sidebar.appendChild($chatsWrapper);

  const $titleBox = document.createElement("div");
  $titleBox.classList.add("titleBox");
  $chatsWrapper.appendChild($titleBox);

  //타이틀
  const $title = Title();
  $titleBox.appendChild($title);

  //검색
  const $search = Search();
  $titleBox.appendChild($search);

  //채팅 목록
  const $listWrapper = document.createElement("div");
  $listWrapper.classList.add("listWrapper");
  $chatsWrapper.appendChild($listWrapper);

  /*
  todo : 메세지 수신한 경우 예시
  socket.onmessage = () => {
    const list = [{ id: 2, cnt: 0 }, { id: 3, cnt: 4 }]);
    addChatContents(id, {socket response});
    fetchChats(list);
  }
  */

  //사이드바 외부 영역
  const $overlay = document.createElement("div");
  $overlay.classList.add("overlay");

  $overlay.addEventListener("click", (e) => {
    $chatsWrapper.classList.remove("showSidebar");
    $overlay.classList.remove("showOverlay");
  });
  $sidebar.appendChild($overlay);
}
