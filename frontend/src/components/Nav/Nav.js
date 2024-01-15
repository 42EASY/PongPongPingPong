export default function Nav() {
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
  $navChatBtn.setAttribute("href", "#"); //chat page path
  $navChatBtn.classList.add("navTextBtn");
  $navChatBtn.innerHTML = "Chat";
  $navFriendsBtn.setAttribute("href", "#"); //friends page path
  $navFriendsBtn.classList.add("navTextBtn");
  $navFriendsBtn.innerHTML = "Friends";
  $navGameBtn.setAttribute("href", "#");
  $navGameBtn.classList.add("navGameBtn");
  const $navGameBtnIcon = document.createElement("i");
  $navGameBtnIcon.classList.add("bi", "bi-controller", "navGameBtnIcon");
  $navGameBtn.appendChild($navGameBtnIcon);
  $navGameBtn.append("게임하러 가기");

  return $navWrapper;
}
