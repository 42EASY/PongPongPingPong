import OtherBtn from "./OtherBtn.js";
import Modal from "../Modal/Modal.js";
import { postBlock } from "./UserApi.js";
import { inviteGame } from "../Nav/InviteQueue.js";

export default function MoreMenu(user) {
  const $MoreMenuWrapper = document.createElement("div");
  const $MoreMenu = document.createElement("ul");
  const $InviteGameOption = document.createElement("li");
  const $InviteGameIcon = document.createElement("i");
  const $BlockOption = document.createElement("li");
  const $BlockIcon = document.createElement("i");

  $MoreMenuWrapper.classList.add("moreMenuWrapper");
  $MoreMenuWrapper.appendChild($MoreMenu);
  $MoreMenu.classList.add("list-group", "moreMenu");
  $MoreMenu.appendChild($InviteGameOption);
  $InviteGameOption.classList.add("list-group-item", "moreMenuList");
  $InviteGameOption.appendChild($InviteGameIcon);
  $InviteGameIcon.classList.add("bi", "bi-envelope-open", "menuIcon");
  $InviteGameOption.append("게임초대");
  $MoreMenu.appendChild($BlockOption);
  $BlockOption.classList.add("list-group-item", "moreMenuList", "menuListRed");
  $BlockOption.appendChild($BlockIcon);
  $BlockIcon.classList.add("bi", "bi-person-dash", "menuIcon");
  $BlockOption.append("차단하기");

  $InviteGameOption.addEventListener("click", () => {
    inviteGame(user.user_id, user.status);
  });

  $BlockOption.addEventListener("click", () => {
    Modal("blockFriend", user.nickname).then((result) => {
      if (result.isPositive) {
        postBlock(user.user_id, user.status);
        const $ProfileBtnBox = document.querySelector("#profileBtnBox");
        $ProfileBtnBox.innerHTML = "";
        $ProfileBtnBox.appendChild(OtherBtn(user, "BLOCK"));
      }
    });
  });

  return $MoreMenuWrapper;
}
