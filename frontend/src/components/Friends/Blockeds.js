import Blocked from "./Blocked.js";
import NoFriend from "./NoFriend.js";
import NoSearch from "./NoSearch.js";

export default function Blockeds(data) {
  const $listWrapper = document.createElement("div");
  $listWrapper.classList.add("friendsWrapper");

  const len = data.length;
  const keyword = document.getElementById("searchInput").value;
  if (len === 0) {
    if (keyword === "") {
      $listWrapper.style.flexDirection = "unset";
      const $noFriend = NoFriend();
      $listWrapper.appendChild($noFriend);
    } else {
      console.log("nosearch");
      const $noSearch = NoSearch();
      $listWrapper.appendChild($noSearch);
    }
  } else {
    for (let i = 0; i < len; i++) {
      const $blocked = Blocked(data[i]);
      $listWrapper.appendChild($blocked);
    }
  }

  return $listWrapper;
}
