import Title from "../components/Friends/Title.js";
import Search from "../components/Friends/Search.js";
import List from "../components/Friends/Friends.js";

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
  //todo: 타이틀 클릭 이벤트에 따라 친구 목록/차단 목록 보여주기
  const $list = List();
  $friendsWrapper.appendChild($list);

  $app.appendChild($friendsWrapper);
}
