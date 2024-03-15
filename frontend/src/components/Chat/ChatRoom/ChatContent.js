import Profile from "../../../pages/Profile.js";

export default function ChatContent(user, data) {
  const $chatContentWrapper = document.createElement("div");
  $chatContentWrapper.classList.add("chatContentWrapper");

  const $chatContentImg = document.createElement("img");
  $chatContentImg.setAttribute("src", user.image_url);
  $chatContentImg.setAttribute("alt", "profileImg");
  $chatContentImg.classList.add("chatContentImg");

  const $chatContentRight = document.createElement("div");
  $chatContentRight.classList.add("chatContentRight");

  const $chatContentInfo = document.createElement("div");
  $chatContentInfo.classList.add("chatContentInfo");

  const $chatContentName = document.createElement("div");
  $chatContentName.classList.add("chatContentName");
  $chatContentName.innerText = user.nickname;

  const $chatContentTime = document.createElement("div");
  $chatContentTime.classList.add("chatContentTime");
  $chatContentTime.innerText = data.timestamp;

  const $chatContent = document.createElement("div");
  $chatContent.classList.add("chatContent");
  $chatContent.innerText = data.message;

  $chatContentInfo.appendChild($chatContentName);
  $chatContentInfo.appendChild($chatContentTime);
  $chatContentRight.appendChild($chatContentInfo);
  $chatContentRight.appendChild($chatContent);
  $chatContentWrapper.appendChild($chatContentImg);
  $chatContentWrapper.appendChild($chatContentRight);

  //이미지, 이름 클릭 시 프로필 보기
  $chatContentImg.addEventListener("click", () => {
    Profile(user);
  });
  $chatContentName.addEventListener("click", () => {
    Profile(user);
  });

  return $chatContentWrapper;
}
