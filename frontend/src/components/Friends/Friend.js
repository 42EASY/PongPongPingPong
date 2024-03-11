import Options from "./Options.js";
import Modal from "../Modal/Modal.js";
import { deleteFriend, postBlock } from "../Main/UserApi.js";

export default function Friend(user) {
  const $friendWrapper = document.createElement("div");
  $friendWrapper.classList.add("friendWrapper");

  const $friendInfo = document.createElement("div");
  $friendInfo.classList.add("profileInfo");

  const $optionsBox = document.createElement("div");
  $optionsBox.classList.add("optionsBox");

  const $optionsButton = document.createElement("button");
  $optionsButton.classList.add("btn", "friendButton");
  const $optionsIcon = document.createElement("i");
  $optionsIcon.classList.add("bi", "bi-three-dots-vertical");

  const $options = Options(user.user_id);

  const $friendImage = document.createElement("img");
  $friendImage.classList.add("profileImg");
  if (user.image_url === null) user.image_url = "./src/images/none_profile.png";
  $friendImage.setAttribute("src", user.image_url);
  $friendImage.setAttribute("alt", "profile_image");

  const $friendName = document.createElement("div");
  $friendName.classList.add("profileName");
  $friendName.innerHTML = user.nickname;

  const $friendStatus = document.createElement("div");

  //접속중 : online, 게임중 : inGame, 오프라인 : offline
  if (user.status === "OFFLINE")
    $friendStatus.classList.add("friendStatus", "offline");
  else if (user.status === "ONLINE")
    $friendStatus.classList.add("friendStatus", "online");
  else $friendStatus.classList.add("friendStatus", "inGame");

  $friendInfo.appendChild($friendImage);
  $friendInfo.appendChild($friendName);
  $friendInfo.appendChild($friendStatus);

  $optionsButton.appendChild($optionsIcon);
  $optionsBox.appendChild($optionsButton);
  $optionsBox.appendChild($options);

  $friendWrapper.appendChild($friendInfo);
  $friendWrapper.appendChild($optionsBox);

  // ... 옵션 클릭 이벤트
  $optionsButton.addEventListener("click", () => {
    $options.style.display = "block";
  });

  // 옵션 외부 클릭 이벤트
  document.addEventListener("click", (e) => {
    if (!$options.contains(e.target)) $options.style.display = "none";
  });

  // 친구 끊기 클릭 이벤트
  const $unfriendOpt = $options.querySelector("#unfriendOpt");
  $unfriendOpt.addEventListener("click", () => {
    Modal("deleteFriend").then((result) => {
      if (result.isPositive) {
        deleteFriend(user.user_id);
        $friendWrapper.style.display = "none";
      }
    });
  });

  // 친구 차단하기 클릭 이벤트
  const $blockOpt = $options.querySelector("#blockOpt");
  $blockOpt.addEventListener("click", () => {
    Modal("blockFriend").then((result) => {
      if (result.isPositive) {
        postBlock(user.user_id);
        $friendWrapper.style.display = "none";
      }
    });
  });

  return $friendWrapper;
}
