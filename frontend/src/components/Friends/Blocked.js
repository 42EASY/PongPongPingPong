import { deleteBlock } from "../Main/UserApi.js";
import Modal from "../Modal/Modal.js";

export default function Blocked(user) {
  const $blockedWrapper = document.createElement("div");
  $blockedWrapper.classList.add("friendWrapper");

  const $blockedInfo = document.createElement("div");
  $blockedInfo.classList.add("profileInfo");

  const $blockedButton = document.createElement("div");
  $blockedButton.classList.add("btn", "blockedButton");
  $blockedButton.innerHTML = "차단 해제";
  $blockedButton.addEventListener("click", () => {
    Modal("unblockFriend", user.nickname).then((result) => {
      if (result.isPositive) {
        deleteBlock(user.user_id);
        $blockedWrapper.style.display = "none";
      }
    });
  });

  const $blockedImage = document.createElement("img");
  $blockedImage.classList.add("profileImg");
  $blockedImage.setAttribute("src", user.image_url);
  $blockedImage.setAttribute("alt", "profile_image");

  const $blockedName = document.createElement("div");
  $blockedName.classList.add("profileName");
  $blockedName.innerHTML = user.nickname;

  $blockedInfo.appendChild($blockedImage);
  $blockedInfo.appendChild($blockedName);

  $blockedWrapper.appendChild($blockedInfo);
  $blockedWrapper.appendChild($blockedButton);

  return $blockedWrapper;
}
