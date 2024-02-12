import NavProfileMenu from "./NavProfileMenu.js";

export default function NavBar() {
  const $navWrapper = document.createElement("div");
  const $navBar = document.createElement("nav");
  const $navBrand = document.createElement("div");
  const $navBrandImage = document.createElement("img");

  $navWrapper.appendChild($navBar);
  $navBar.id = "navBar";
  $navBar.appendChild($navBrand);

  $navBrand.classList.add("navBrand");
  $navBrandImage.setAttribute("src", "./src/images/sponge.png");
  $navBrandImage.setAttribute("alt", "brand_logo_image");
  $navBrandImage.classList.add("navBrandImage");
  $navBrand.appendChild($navBrandImage);
  $navBrand.append("퐁퐁핑퐁");

  const $navSearchBox = document.createElement("div");
  const $navSearchIcon = document.createElement("i");
  const $navSearch = document.createElement("input");
  const $navSearchList = document.createElement("ul");

  $navBar.appendChild($navSearchBox);
  $navSearchBox.appendChild($navSearchIcon);
  $navSearchBox.id = "navSearchBox";
  $navSearchIcon.classList.add("bi", "bi-search");
  $navSearchBox.appendChild($navSearch);
  $navSearchBox.classList.add("navSearchBox");
  $navSearch.id = "navSearch";
  $navSearch.classList.add("navSearch");
  $navSearch.setAttribute("type", "text");
  $navSearch.setAttribute("placeholder", "Search");
  $navSearch.setAttribute("maxlength", "10");
  $navSearch.setAttribute("autocomplete", "off");
  $navSearchBox.appendChild($navSearchList);
  $navSearchList.id = "navSearchList";
  $navSearchList.classList.add("list-group", "navSearchList");

  const $navBtns = document.createElement("div");
  const $navProfileBox = document.createElement("div");
  const $navProfileBtn = document.createElement("div");
  const $navProfileBtnImage = document.createElement("img");
  const $navProfileMenu = NavProfileMenu();
  const $navVerticalLine = document.createElement("div");
  const $navChatBtn = document.createElement("a");
  const $navFriendsBtn = document.createElement("a");
  const $navGameBtn = document.createElement("a");

  $navBar.appendChild($navBtns);
  $navBtns.appendChild($navProfileBox);
  $navBtns.appendChild($navVerticalLine);
  $navBtns.appendChild($navChatBtn);
  $navBtns.appendChild($navFriendsBtn);
  $navBtns.appendChild($navGameBtn);
  $navBtns.classList.add("navBtns");
  $navProfileBox.appendChild($navProfileBtn);
  $navProfileBox.appendChild($navProfileMenu);
  $navProfileBtn.appendChild($navProfileBtnImage);
  $navProfileBox.classList.add("navProfileBox");
  $navProfileBtn.classList.add("navProfileBtn");
  $navProfileBtnImage.setAttribute("alt", "profile_image");
  $navProfileBtnImage.classList.add("navProfileBtnImage");
  $navVerticalLine.classList.add("navVerticalLine");
  $navChatBtn.classList.add("navTextBtn", "navChat");
  $navChatBtn.innerHTML = "Chat";
  $navFriendsBtn.classList.add("navTextBtn", "navFriends");
  $navFriendsBtn.innerHTML = "Friends";
  $navGameBtn.classList.add("btn", "navGameBtn");
  const $navGameBtnIcon = document.createElement("i");
  $navGameBtnIcon.classList.add("bi", "bi-controller", "navGameBtnIcon");
  $navGameBtn.appendChild($navGameBtnIcon);
  $navGameBtn.append("게임하러 가기");

  return $navWrapper;
}
