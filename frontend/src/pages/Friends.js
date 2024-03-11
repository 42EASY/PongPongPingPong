import Title from "../components/Friends/Title.js";
import Search from "../components/Friends/Search.js";
import FriendList from "../components/Friends/Friends.js";
import BlockedList from "../components/Friends/Blockeds.js";
import { getFriends, getBlockeds } from "../components/Friends/ListApi.js";

let isFriends = true;
let curPage = 1;
let dataSize = 8;
let isFetching = false;
let hasMore = true;

async function fetchFriends(keyword) {
  const $wrapper = document.querySelector(".listWrapper");

  isFriends = true;
  isFetching = true;
  const flist = await getFriends(keyword, curPage, dataSize);
  console.log(flist);
  isFetching = false;

  const list = FriendList(flist.result.data);
  if (flist.result.data.length === 0 || flist.result.data.length < dataSize) {
    hasMore = false;
    if (list.innerHTML !== $wrapper.innerHTML) $wrapper.innerHTML = "";
  } else {
    curPage++;
  }
  $wrapper.appendChild(list);
}

async function fetchBlockeds(keyword) {
  const $wrapper = document.querySelector(".listWrapper");

  isFriends = false;
  isFetching = true;
  const blist = await getBlockeds(keyword, curPage, dataSize);
  isFetching = false;
  const list = BlockedList(blist.result.data);
  if (blist.result.data.length === 0 || blist.result.data.length < dataSize) {
    hasMore = false;
    if (list.innerHTML !== $wrapper.innerHTML) $wrapper.innerHTML = "";
  } else {
    curPage++;
  }
  $wrapper.appendChild(list);
}

export default function Friends() {
  const $sidebar = document.querySelector(".sidebar");
  $sidebar.innerHTML = "";

  //전체 영역
  const $friendsWrapper = document.createElement("div");
  $friendsWrapper.classList.add("sidebarArea");
  $sidebar.appendChild($friendsWrapper);

  //타이틀
  const $title = Title();
  $friendsWrapper.appendChild($title);

  //검색
  const $search = Search();
  $friendsWrapper.appendChild($search);

  //친구 목록
  const $listWrapper = document.createElement("div");
  $listWrapper.classList.add("listWrapper");
  $friendsWrapper.appendChild($listWrapper);

  fetchFriends("");

  //사이드바 외부 영역
  const $overlay = document.createElement("div");
  $overlay.classList.add("overlay");

  //사이드바 외부 영역 클릭 이벤트
  $overlay.addEventListener("click", (e) => {
    $friendsWrapper.classList.remove("showSidebar");
    $overlay.classList.remove("showOverlay");
  });
  $sidebar.appendChild($overlay);

  //타이틀 클릭 이벤트
  $title.addEventListener("click", async (e) => {
    const $friendList = document.querySelector(".friendList");
    const $blockedList = document.querySelector(".blockedList");
    curPage = 1;
    hasMore = true;
    $searchInput.value = "";
    $listWrapper.innerHTML = "";
    if (e.target.classList.contains("friendList")) {
      $friendList.classList.add("friendsTitleSelect", "titleSelect");
      $blockedList.classList.remove("friendsTitleSelect", "titleSelect");
      fetchFriends("");
    } else if (e.target.classList.contains("blockedList")) {
      $friendList.classList.remove("friendsTitleSelect", "titleSelect");
      $blockedList.classList.add("friendsTitleSelect", "titleSelect");
      fetchBlockeds("");
    }
  });

  //검색 입력 이벤트
  const $searchInput = document.getElementById("searchInput");
  $searchInput.addEventListener("input", () => {
    console.log($searchInput.value);
    curPage = 1;
    hasMore = true;
    if (isFriends) fetchFriends($searchInput.value);
    else fetchBlockeds($searchInput.value);
  });

  //todo: scroll event
}
