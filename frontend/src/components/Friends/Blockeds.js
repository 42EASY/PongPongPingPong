import Blocked from "./Blocked.js";
import NoFriend from "./NoFriend.js";
import NoSearch from "./NoSearch.js";

export default function Blockeds() {
  const $listWrapper = document.createElement("div");
  $listWrapper.classList.add("friendsWrapper");

  //todo: api 호출
  const $blocked = Blocked();
  $listWrapper.appendChild($blocked);
  const $blocked1 = Blocked();
  $listWrapper.appendChild($blocked1);

  //친구 없을 경우
  // $listWrapper.style.flexDirection = "unset";
  // const $noFriend = NoFriend();
  // $listWrapper.appendChild($noFriend);

  //친구 검색 결과 없을 경우
  // const $noSearch = NoSearch();
  // $listWrapper.appendChild($noSearch);

  return $listWrapper;
}
