import changeUrl from "../Router.js";
import NavBar from "../components/Nav/NavBar.js";
import Chat from "../pages/Chat.js";
import Friends from "./Friends.js";
import { getUserList, postLogout } from "../components/Nav/NavApi.js";
import FastGameStart from "../components/Nav/FastGameStart.js";
import Modal from "../components/Modal/Modal.js";

export default async function Nav() {
  const $navbar = document.querySelector(".nav");
  $navbar.innerHTML = NavBar().innerHTML;

  //로고 클릭이벤트
  const $navBrand = document.querySelector(".navBrand");
  $navBrand.addEventListener("click", () => {
    changeUrl("/main");
  });

  //프로필 클릭이벤트
  const $navProfile = document.querySelector(".navProfileBox");
  const $navProfileMenu = document.querySelector(".profileMenuWrapper");
  $navProfile.addEventListener("click", () => {
    $navProfileMenu.style.display = "block";
  });

  // 로그아웃 클릭이벤트
  $navProfileMenu.addEventListener("click", () => {
    postLogout();
    changeUrl("/");
  });

  const $input = document.querySelector("#navSearch");
  const $searchBox = document.getElementById("navSearchBox");
  const $searchList = document.querySelector(".navSearchList");

  document.addEventListener("click", (e) => {
    if (!$searchBox.contains(e.target)) $searchList.style.display = "none";
    if (!$navProfile.contains(e.target)) $navProfileMenu.style.display = "none";
  });

  let prevList;
  let arr;
  let idx = -1;
  $input.addEventListener("keyup", async (e) => {
    const keyword = e.target.value;
    $searchList.style.display = "block";
    let $item;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      let max = arr.size - 1;
      if (idx !== -1) {
        $item = document.getElementById("navSearchItem" + idx);
        $item.classList.remove("navSearchItemSelected");
      }
      if (e.key === "ArrowUp") {
        if (idx === -1 || idx === 0) idx = max;
        else idx--;
      }
      if (e.key === "ArrowDown") {
        if (idx === max) idx = 0;
        else idx++;
      }
      $item = document.getElementById("navSearchItem" + idx);
      $item.classList.add("navSearchItemSelected");
    } else if (e.key === "Enter") {
      if (idx !== -1)
        changeUrl(
          "/main",
          arr.get(document.getElementById("navSearchItem" + idx).innerHTML)
        );
    } else {
      idx = -1;
      if (keyword.length !== 0) {
        const list = await getUserList(keyword, 1, 5);
        if (list !== prevList) {
          arr = new Map();
          $searchList.innerHTML = "";
          for (let i = 0; i < list.result.data.length; i++) {
            const $searchItem = document.createElement("div");
            $searchItem.classList.add("list-group-item", "navSearchItem");
            $searchItem.id = "navSearchItem" + i;
            $searchItem.innerHTML = list.result.data[i].nickname;
            $searchList.appendChild($searchItem);
            arr.set($searchItem.innerHTML, list.result.data[i].user_id);
            $searchItem.onclick = (e) => {
              changeUrl("/main", arr.get(e.target.innerHTML));
            };
          }
          prevList = list;
        }
      } else {
        $searchList.style.display = "none";
        prevList = "";
        $searchList.innerHTML = "";
      }
    }
  });

  //chat 클릭이벤트
  const $chatButton = document.querySelector(".navChat");
  $chatButton.addEventListener("click", (e) => {
    Chat();
    const $sidebar = document.querySelector(".sidebarArea");
    const $overlay = document.querySelector(".overlay");
    $sidebar.classList.add("showSidebar");
    $overlay.classList.add("showOverlay");
  });

  //friends 클릭이벤트
  const $friendsButton = document.querySelector(".navFriends");
  $friendsButton.addEventListener("click", async () => {
    await Friends();
    const $sidebar = document.querySelector(".sidebarArea");
    const $overlay = document.querySelector(".overlay");
    $sidebar.classList.add("showSidebar");
    $overlay.classList.add("showOverlay");
  });

  //게임하러 가기 클릭이벤트
  const $navGameBtn = document.querySelector(".navGameBtn");
  $navGameBtn.addEventListener("click", () => {
    FastGameStart();
  });
}
