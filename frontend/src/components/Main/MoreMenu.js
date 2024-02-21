import OtherBtn from "./OtherBtn.js";
import Modal from "../Modal/Modal.js";
import { postBlock } from "./UserApi.js";

export default function MoreMenu(id) {
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
    // todo: 게임 초대
  });

  $BlockOption.addEventListener("click", () => {
    Modal("blockFriend").then((result) => {
      if (result.isPositive) {
        postBlock(id);
        const $ProfileBtnBox = document.querySelector("#profileBtnBox");
        $ProfileBtnBox.innerHTML = "";
        $ProfileBtnBox.appendChild(OtherBtn(id, "BLOCK"));
      }
    });
  });

  return $MoreMenuWrapper;
}
