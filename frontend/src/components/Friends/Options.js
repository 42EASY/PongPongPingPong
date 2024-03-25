import changeUrl from "../../Router.js";
import ChatRoom from "../../pages/ChatRoom.js";
import { inviteGame } from "../Nav/InviteQueue.js";

export default function Options(id, status) {
  const $OptionsWrapper = document.createElement("div");
  $OptionsWrapper.classList.add("optionsWrapper");

  const $Options = document.createElement("ul");
  $Options.classList.add("list-group", "options");
  $OptionsWrapper.appendChild($Options);

  const $profileOpt = document.createElement("li");
  $profileOpt.classList.add("list-group-item", "optionsItem");
  $profileOpt.innerHTML = "프로필 상세보기";
  $Options.appendChild($profileOpt);
  $profileOpt.addEventListener("click", () => {
    changeUrl("/main", id);
  });

  const $messageOpt = document.createElement("li");
  $messageOpt.classList.add("list-group-item", "optionsItem");
  $messageOpt.innerHTML = "메시지 보내기";
  $Options.appendChild($messageOpt);
  $messageOpt.addEventListener("click", () => {
    ChatRoom(id);
  });

  const $gameOpt = document.createElement("li");
  $gameOpt.classList.add("list-group-item", "optionsItem");
  $gameOpt.innerHTML = "게임 초대하기";
  $Options.appendChild($gameOpt);
  $gameOpt.addEventListener("click", () => {
    inviteGame(id, status);
  });

  const $unfriendOpt = document.createElement("li");
  $unfriendOpt.classList.add("list-group-item", "optionsItem", "optionListRed");
  $unfriendOpt.id = "unfriendOpt";
  $unfriendOpt.innerHTML = "친구 끊기";
  $Options.appendChild($unfriendOpt);

  const $blockOpt = document.createElement("li");
  $blockOpt.classList.add("list-group-item", "optionsItem", "optionListRed");
  $blockOpt.id = "blockOpt";
  $blockOpt.innerHTML = "차단하기";
  $Options.appendChild($blockOpt);

  return $OptionsWrapper;
}
