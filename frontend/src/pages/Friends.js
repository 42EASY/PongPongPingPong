import Title from "../components/Friends/Title.js";
import Search from "../components/Friends/Search.js";
import FriendList from "../components/Friends/Friends.js";
import BlockedList from "../components/Friends/Blockeds.js";

export default function Friends() {
  const $sidebar = document.querySelector(".friendsSidebar");

  //전체 영역
  const $friendsWrapper = document.createElement("div");
  $friendsWrapper.classList.add("friendsWrapper");

  //타이틀
  const $title = Title();
  $friendsWrapper.appendChild($title);

  //검색
  const $search = Search();
  $friendsWrapper.appendChild($search);

  //친구 목록
  var $list = FriendList();
  $friendsWrapper.appendChild($list);

  //사이드바 외부 영역
  const $overlay = document.createElement("div");
  $overlay.classList.add("friendsOverlay");

  $overlay.addEventListener("click", (e) => {
    $friendsWrapper.classList.remove("showFriends");
    $overlay.style.display = "none";
  });
  $sidebar.appendChild($overlay);

  //타이틀 클릭 이벤트
  $title.addEventListener("click", (e) => {
    const $friendList = document.querySelector(".friendList");
    const $blockedList = document.querySelector(".blockedList");

    $friendsWrapper.removeChild($list);

    if (e.target.classList.contains("friendList")) {
      $friendList.classList.add("titleSelect");
      $blockedList.classList.remove("titleSelect");

      $list = FriendList();
      $friendsWrapper.appendChild($list);
    } else if (e.target.classList.contains("blockedList")) {
      $friendList.classList.remove("titleSelect");
      $blockedList.classList.add("titleSelect");

      $list = BlockedList();
      $friendsWrapper.appendChild($list);
    }
  });

  $sidebar.appendChild($friendsWrapper);
}
