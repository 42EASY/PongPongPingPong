import Title from "../components/Chat/Title.js";
import Search from "../components/Friends/Search.js";
import List from "../components/Chat/ChatList.js";
import WebSocketManager from '../state/WebSocketManager.js';

async function fetchChats(list) {
  const $wrapper = document.querySelector(".listWrapper");

  const $list = await List(list);
  $wrapper.appendChild($list);
}

export default function Chat() {
  const $sidebar = document.querySelector(".sidebar");
  $sidebar.innerHTML = "";

  const socket = WebSocketManager.getInstance();

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

  //채팅 목록
  const $listWrapper = document.createElement("div");
  $listWrapper.classList.add("listWrapper");
  $chatsWrapper.appendChild($listWrapper);
  
  socket.send(JSON.stringify({ action: "fetch_chat_list" }));

  socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.action === "fetch_chat_list") {
      const list = data.data;
      fetchChats(list);
    }
  };

  //사이드바 외부 영역
  const $overlay = document.createElement("div");
  $overlay.classList.add("overlay");

  $overlay.addEventListener("click", (e) => {
    $chatsWrapper.classList.remove("showSidebar");
    $overlay.classList.remove("showOverlay");
  });
  $sidebar.appendChild($overlay);
}
