export default function NavBar() {
  const $navWrapper = document.createElement("div");
  const $navBar = document.createElement("nav");
  const $navBrand = document.createElement("a");
  const $navBrandImage = document.createElement("img");

  $navWrapper.appendChild($navBar);
  $navBar.id = "navBar";
  $navBar.appendChild($navBrand);

  $navBrand.setAttribute("href", "#"); //main 경로 추가
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
  const $navSearchItem = document.createElement("li");
  const $navSearchItem2 = document.createElement("li");

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
  //Todo: 아래 부분 api로 받아 반복문으로 수정
  $navSearchList.appendChild($navSearchItem);
  $navSearchList.appendChild($navSearchItem2);
  $navSearchItem.append("nickname");
  $navSearchItem.classList.add("list-group-item", "navSearchItem");
  $navSearchItem2.append("nickname2");
  $navSearchItem2.classList.add("list-group-item", "navSearchItem");

  const $navBtns = document.createElement("div");
  const $navProfileBtn = document.createElement("a");
  const $navProfileBtnImage = document.createElement("img");
  const $navVerticalLine = document.createElement("div");
  const $navChatBtn = document.createElement("a");
  const $navFriendsBtn = document.createElement("a");
  const $navGameBtn = document.createElement("a");

  $navBar.appendChild($navBtns);
  $navBtns.appendChild($navProfileBtn);
  $navBtns.appendChild($navVerticalLine);
  $navBtns.appendChild($navChatBtn);
  $navBtns.appendChild($navFriendsBtn);
  $navBtns.appendChild($navGameBtn);
  $navBtns.classList.add("navBtns");
  $navProfileBtn.appendChild($navProfileBtnImage);
  $navProfileBtn.setAttribute("href", "#"); //main page path
  $navProfileBtn.classList.add("navProfileBtn");
  $navProfileBtnImage.setAttribute("src", ""); //profile image path
  $navProfileBtnImage.setAttribute("alt", "profile_image");
  $navProfileBtnImage.classList.add("navProfileBtnImage");
  $navVerticalLine.classList.add("navVerticalLine");
  $navChatBtn.classList.add("navTextBtn", "navChat");
  $navChatBtn.innerHTML = "Chat";
  $navFriendsBtn.classList.add("navTextBtn", "navFriends");
  $navFriendsBtn.innerHTML = "Friends";
  $navGameBtn.setAttribute("href", "#");
  $navGameBtn.classList.add("navGameBtn");
  const $navGameBtnIcon = document.createElement("i");
  $navGameBtnIcon.classList.add("bi", "bi-controller", "navGameBtnIcon");
  $navGameBtn.appendChild($navGameBtnIcon);
  $navGameBtn.append("게임하러 가기");

  return $navWrapper;
}
