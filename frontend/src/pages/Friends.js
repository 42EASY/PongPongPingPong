import Title from "../components/Friends/Title.js";
import Search from "../components/Friends/Search.js";
import FriendList from "../components/Friends/Friends.js";
import BlockedList from "../components/Friends/Blockeds.js";
import { getFriends, getBlockeds } from "../components/Friends/ListApi.js";

let isFriends = true;
let curPage = 1;
let dataSize = 30;
let isFetching = false;
let hasMore = true;

async function fetchFriends(keyword) {
  isFriends = true;
  isFetching = true;
  const flist = await getFriends(keyword, curPage, dataSize);
  isFetching = false;

  if (
    flist.result.data.length === 0 ||
    flist.result.data.length < dataSize ||
    curPage === flist.result.total_page
  ) {
    hasMore = false;
  } else {
    curPage++;
  }
  return FriendList(flist.result.data);
}

async function fetchBlockeds(keyword) {
  isFriends = false;
  isFetching = true;
  const blist = await getBlockeds(keyword, curPage, dataSize);
  isFetching = false;
  if (
    blist.result.data.length === 0 ||
    blist.result.data.length < dataSize ||
    curPage === blist.result.total_page
  ) {
    hasMore = false;
  } else {
    curPage++;
  }
  return BlockedList(blist.result.data);
}

function appendData(data) {
  let $listWrapper = document.querySelector(".friendsWrapper");
  $listWrapper.innerHTML = "";
  $listWrapper.appendChild(data);
}

export default async function Friends() {
  const $sidebar = document.querySelector(".sidebar");
  $sidebar.innerHTML = "";

  curPage = 1;

  //전체 영역
  const $friendsWrapper = document.createElement("div");
  $friendsWrapper.classList.add("sidebarArea");
  $sidebar.appendChild($friendsWrapper);

  const $titleBox = document.createElement("div");
  $titleBox.classList.add("titleBox");
  $friendsWrapper.appendChild($titleBox);

  //타이틀
  const $title = Title();
  $titleBox.appendChild($title);

  //검색
  const $search = Search();
  $titleBox.appendChild($search);

  //친구 목록
  let $listWrapper = document.createElement("div");
  $listWrapper.classList.add("listWrapper");
  $friendsWrapper.appendChild($listWrapper);

  let $friends = document.createElement("div");
  $friends.classList.add("friendsWrapper");
  $listWrapper.appendChild($friends);

  $listWrapper.replaceChild(await fetchFriends(""), $friends);

  //사이드바 외부 영역
  const $overlay = document.createElement("div");
  $overlay.classList.add("overlay");

  //사이드바 외부 영역 클릭 이벤트
  $overlay.addEventListener("click", (e) => {
    $friendsWrapper.classList.remove("showSidebar");
    $overlay.classList.remove("showOverlay");
    curPage = 1;
  });
  $sidebar.appendChild($overlay);

  //타이틀 클릭 이벤트
  $title.addEventListener("click", async (e) => {
    const $friendList = document.querySelector(".friendList");
    const $blockedList = document.querySelector(".blockedList");
    curPage = 1;
    hasMore = true;
    $searchInput.value = "";
    $friendsWrapper.scrollTo({ top: 0, left: 0, behavior: "smooth" });

    let childNodes = $listWrapper.childNodes;
    for (let i = childNodes.length - 1; i > 0; i--)
      $listWrapper.removeChild(childNodes[i]);
    if (e.target.classList.contains("friendList")) {
      $friendList.classList.add("friendsTitleSelect", "titleSelect");
      $blockedList.classList.remove("friendsTitleSelect", "titleSelect");
      const $data = await fetchFriends($searchInput.value);
      try {
        $listWrapper.replaceChild($data, $friends);
      } catch (error) {
        appendData($data);
      }
    } else if (e.target.classList.contains("blockedList")) {
      $friendList.classList.remove("friendsTitleSelect", "titleSelect");
      $blockedList.classList.add("friendsTitleSelect", "titleSelect");
      const $data = await fetchBlockeds($searchInput.value);
      try {
        $listWrapper.replaceChild($data, $friends);
      } catch (error) {
        appendData($data);
      }
    }
  });

  //검색 입력 이벤트
  const $searchInput = document.getElementById("searchInput");
  $searchInput.addEventListener("focus", () => {
    $friendsWrapper.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  });
  $searchInput.addEventListener("keyup", async () => {
    curPage = 1;
    hasMore = true;
    let childNodes = $listWrapper.childNodes;
    for (let i = childNodes.length - 1; i > 0; i--)
      $listWrapper.removeChild(childNodes[i]);
    if (isFriends) {
      const $data = await fetchFriends($searchInput.value);
      try {
        $listWrapper.replaceChild($data, $friends);
      } catch (error) {
        appendData($data);
      }
    } else {
      const $data = await fetchBlockeds($searchInput.value);
      try {
        $listWrapper.replaceChild($data, $friends);
      } catch (error) {
        appendData($data);
      }
    }
  });

  //scroll event
  $friendsWrapper.addEventListener("scroll", async () => {
    if (isFetching || !hasMore) return;
    if (
      $friendsWrapper.scrollTop + $friendsWrapper.clientHeight >=
      $friendsWrapper.scrollHeight
    ) {
      let data;
      if (isFriends) data = await fetchFriends($searchInput.value);
      else data = await fetchBlockeds($searchInput.value);
      $listWrapper.appendChild(data);
    }
  });

  window.onload = function () {
    document.body.style.display = "block";
  };
}
