import Friend from "./Friend.js";
import NoFriend from "./NoFriend.js";
import NoSearch from "./NoSearch.js";

export default function Friends(data) {
  const $listWrapper = document.createElement("div");
  $listWrapper.classList.add("friendsWrapper");

  const len = data.length;
  const keyword = document.getElementById("searchInput").value;
  if (len === 0) {
    if (keyword === "") {
      const $noFriend = NoFriend();
      $listWrapper.appendChild($noFriend);
    } else {
      const $noSearch = NoSearch();
      $listWrapper.appendChild($noSearch);
    }
  } else {
    for (let i = 0; i < len; i++) {
      const $friend = Friend(data[i]);
      $listWrapper.appendChild($friend);
    }
  }
  return $listWrapper;
}
