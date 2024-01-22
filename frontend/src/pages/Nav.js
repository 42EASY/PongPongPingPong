import NavBar from "../components/Nav/NavBar.js";
import Chat from "../pages/Chat.js";

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

  const $chatButton = document.querySelector(".navChat");
  $chatButton.addEventListener("click", (e) => {
    const $sidebar = document.querySelector(".chatsWrapper");
    const $overlay = document.querySelector(".overlay");
    $sidebar.classList.add("showSidebar");
    $overlay.style.display = "block";
  });
}
