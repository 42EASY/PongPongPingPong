import Title from "../components/Friends/Title.js";
import Search from "../components/Friends/Search.js";
import FriendList from "../components/Friends/Friends.js";
import BlockedList from "../components/Friends/Blockeds.js";

export default function Friends() {
  const $app = document.querySelector(".App");
  $app.innerHTML = ""; //추후 수정 필요할 수 있음

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

  $app.appendChild($friendsWrapper);
}
