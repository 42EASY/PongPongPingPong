import NavBar from "../components/Nav/NavBar.js";
import Chat from "../pages/Chat.js";
import Friends from "./Friends.js";

export default function Nav() {
  const $navbar = document.querySelector(".nav");
  $navbar.innerHTML = NavBar().innerHTML;

  const searchBox = document.getElementById("navSearchBox");
  const searchList = document.querySelector(".navSearchList");

  document.addEventListener("click", (e) => {
    if (!searchBox.contains(e.target)) searchList.style.display = "none";
  });

  const $input = document.querySelector("#navSearch");
  $input.addEventListener("input", (e) => {
    const value = e.target.value;
    console.log(value);
    if (value.length !== 0) searchList.style.display = "block";
    else searchList.style.display = "none";
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
  $friendsButton.addEventListener("click", (e) => {
    Friends();
    const $sidebar = document.querySelector(".sidebarArea");
    const $overlay = document.querySelector(".overlay");
    $sidebar.classList.add("showSidebar");
    $overlay.classList.add("showOverlay");
  });
}
