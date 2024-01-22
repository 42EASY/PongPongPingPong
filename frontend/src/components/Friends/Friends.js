import Friend from "./Friend.js";
import NoFriend from "./NoFriend.js";
import NoSearch from "./NoSearch.js";

export default function Friends() {
  const $listWrapper = document.createElement("div");
  $listWrapper.classList.add("listWrapper");

  //todo: api 호출
  $listWrapper.style.flexDirection = "column";
  const $friend = Friend();
  $listWrapper.appendChild($friend);
  const $friend1 = Friend();
  $listWrapper.appendChild($friend1);

  //친구 없을 경우
  // const $noFriend = NoFriend();
  // $listWrapper.appendChild($noFriend);

  //친구 검색 결과 없을 경우
  // $listWrapper.style.flexDirection = "column";
  // const $noSearch = NoSearch();
  // $listWrapper.appendChild($noSearch);

  return $listWrapper;
}
