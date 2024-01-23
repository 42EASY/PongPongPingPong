import Profile from "../../../pages/Profile.js";

export default function ChatContent() {
  const $chatContentWrapper = document.createElement("div");
  $chatContentWrapper.classList.add("chatContentWrapper");

  const $chatContentImg = document.createElement("img");
  $chatContentImg.setAttribute("src", "../../images/none_profile.png");
  $chatContentImg.setAttribute("alt", "profileImg");
  $chatContentImg.classList.add("chatContentImg");

  const $chatContentRight = document.createElement("div");
  $chatContentRight.classList.add("chatContentRight");

  const $chatContentInfo = document.createElement("div");
  $chatContentInfo.classList.add("chatContentInfo");

  const $chatContentName = document.createElement("div");
  $chatContentName.classList.add("chatContentName");
  $chatContentName.innerText = "이름";

  const $chatContentTime = document.createElement("div");
  $chatContentTime.classList.add("chatContentTime");
  $chatContentTime.innerText = "오후 10:37";

  const $chatContent = document.createElement("div");
  $chatContent.classList.add("chatContent");
  $chatContent.innerText = "안녕하세요 \n반갑습니다\n 룰루랄라";

  $chatContentInfo.appendChild($chatContentName);
  $chatContentInfo.appendChild($chatContentTime);
  $chatContentRight.appendChild($chatContentInfo);
  $chatContentRight.appendChild($chatContent);
  $chatContentWrapper.appendChild($chatContentImg);
  $chatContentWrapper.appendChild($chatContentRight);

  //이미지, 이름 클릭 시 프로필 보기
  $chatContentImg.addEventListener("click", () => {
    Profile();
  });
  $chatContentName.addEventListener("click", () => {
    Profile();
  });

  return $chatContentWrapper;
}
