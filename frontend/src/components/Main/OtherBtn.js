import MoreMenu from "./MoreMenu.js";
import Chat from "../../pages/Chat.js";
import { postFriend, deleteFriend, deleteBlock } from "./UserApi.js";
import Modal from "../Modal/Modal.js";

export default function OtherBtn(id, status) {
  const $OtherBtnWrapper = document.createElement("div");
  const $FriendStatusBtn = document.createElement("button");
  const $FriendStatusIcon = document.createElement("i");
  const $MessageBtn = document.createElement("button");
  const $MoreFunctionBox = document.createElement("div");
  const $MoreFunctionBtn = document.createElement("button");
  const $MoreFucntionIcon = document.createElement("i");
  const $MoreMenu = MoreMenu(id);

  $OtherBtnWrapper.appendChild($FriendStatusBtn);
  $OtherBtnWrapper.appendChild($MessageBtn);
  $OtherBtnWrapper.appendChild($MoreFunctionBox);
  $MoreFunctionBox.appendChild($MoreFunctionBtn);
  $MoreFunctionBtn.appendChild($MoreFucntionIcon);
  $MoreFunctionBox.appendChild($MoreMenu);

  $OtherBtnWrapper.classList.add("btnWrapper");
  $FriendStatusBtn.classList.add("btn", "mainBtn");
  $FriendStatusIcon.classList.add("bi", "bi-plus-lg", "friendStatusIcon");
  $MessageBtn.classList.add("btn", "mainBtn");
  $MessageBtn.innerHTML = "메세지";
  $MoreFunctionBox.classList.add("moreFunctionBtn");
  $MoreFunctionBtn.classList.add("btn", "mainBtn", "MoreFunctionBtn");
  $MoreFucntionIcon.classList.add("bi", "bi-three-dots");

  const onChangeStatus = (nextStatus) => {
    if (nextStatus === "NONE") {
      $FriendStatusBtn.classList.remove("statusBlocked");
      $FriendStatusBtn.classList.add("statusNotFriend");
      $FriendStatusBtn.innerHTML = "";
      $FriendStatusBtn.appendChild($FriendStatusIcon);
      $FriendStatusBtn.append("친구 추가");
      if (status === "BLOCK") $MoreFunctionBox.appendChild($MoreFunctionBtn);
    } else if (nextStatus === "FRIEND") {
      $FriendStatusBtn.classList.remove("statusNotFriend", "statusBlocked");
      $FriendStatusBtn.innerHTML = "친구";
    } else if (nextStatus === "BLOCK") {
      $FriendStatusBtn.classList.remove("statusNotFriend");
      $FriendStatusBtn.classList.add("statusBlocked");
      $FriendStatusBtn.innerHTML = "차단됨";
      $MoreFunctionBtn.remove();
    }
    status = nextStatus;
  };

  $FriendStatusBtn.onclick = () => {
    if (status === "NONE") {
      postFriend(id);
      onChangeStatus("FRIEND");
    } else if (status === "BLOCK") {
      Modal("unblockFriend").then((result) => {
        if (result.isPositive) {
          deleteBlock(id);
          onChangeStatus("NONE");
        }
      });
    } else if (status === "FRIEND") {
      Modal("deleteFriend").then((result) => {
        if (result.isPositive) {
          deleteFriend(id);
          onChangeStatus("NONE");
        }
      });
    }
  };

  document.addEventListener("click", (e) => {
    if (!$MoreFunctionBox.contains(e.target)) $MoreMenu.style.display = "none";
  });

  $MessageBtn.addEventListener("click", () => {
    Chat();
    const $sidebar = document.querySelector(".sidebarArea");
    const $overlay = document.querySelector(".overlay");
    $sidebar.classList.add("showSidebar");
    $overlay.classList.add("showOverlay");
  });

  $MoreFunctionBtn.addEventListener("click", () => {
    $MoreMenu.style.display = "block";
  });

  onChangeStatus(status);
  return $OtherBtnWrapper;
}
