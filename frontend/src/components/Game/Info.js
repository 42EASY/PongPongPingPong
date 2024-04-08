import { getUserId } from "../../state/State.js";
import { getUserInfo } from "../Main/UserApi.js";

export default async function Info(info) {
  console.log("INFO: ", info);
  const $infoWrapper = document.createElement("div");
  const $leftBox = document.createElement("div");
  const $leftProfileImage = document.createElement("img");
  const $leftName = document.createElement("div");
  const $versus = document.createElement("div");
  const $rightBox = document.createElement("div");
  const $rightProfileImage = document.createElement("img");
  const $rightName = document.createElement("div");

  // 본인
  const rightUserId =
    info.player_info[0].user_id === getUserId()
      ? info.player_info[0].user_id
      : info.player_info[1].user_id;
  const rightInfo = await getUserInfo(rightUserId);
  // 상대
  const leftUserId =
    info.player_info[0].user_id === getUserId()
      ? info.player_info[1].user_id
      : info.player_info[0].user_id;
  const leftInfo = await getUserInfo(leftUserId);

  $leftProfileImage.setAttribute("src", leftInfo.result.image_url);
  $leftProfileImage.setAttribute("alt", "profile image");
  $rightProfileImage.setAttribute("src", rightInfo.result.image_url);
  $rightProfileImage.setAttribute("alt", "profile image");

  $infoWrapper.classList.add("gameInfoWrapper");
  $leftBox.classList.add("leftBox", "infoBox");
  $leftProfileImage.classList.add("leftProfileImage", "profileImage");
  $leftName.classList.add("leftName", "name");
  $versus.classList.add("versus");
  $rightBox.classList.add("rightBox", "infoBox");
  $rightProfileImage.classList.add("rightProfileImage", "profileImage");
  $rightName.classList.add("rightName", "name");

  $infoWrapper.appendChild($leftBox);
  $infoWrapper.appendChild($versus);
  $infoWrapper.appendChild($rightBox);
  $leftBox.appendChild($leftName);
  $leftBox.appendChild($leftProfileImage);
  $rightBox.appendChild($rightProfileImage);
  $rightBox.appendChild($rightName);

  $leftName.innerHTML = leftInfo.result.nickname;
  $versus.innerHTML = "vs";
  $rightName.innerHTML = rightInfo.result.nickname;

  return $infoWrapper;
}
