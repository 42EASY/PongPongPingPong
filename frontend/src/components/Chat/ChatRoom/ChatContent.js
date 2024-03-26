import Profile from "../../../pages/Profile.js";
import { getUserId } from "../../../state/State.js";

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

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
  $chatContentTime.innerText = formatTimestamp(data.timestamp);

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
  if (user.user_id != getUserId()) {
    $chatContentImg.addEventListener("click", () => {
      Profile(user);
    });
    $chatContentName.addEventListener("click", () => {
      Profile(user);
    });
  }

  return $chatContentWrapper;
}
