import GameCount from "./GameCount.js";
import PercentBar from "../GameRoom/PercentBar.js";
import MyBtn from "./MyBtn.js";
import OtherBtn from "./OtherBtn.js";
import { getUserId } from "../../state/State.js";

export default function MyProfile(id, user) {
  let isMe = false;
  if (id === getUserId()) isMe = true;

  const $ProfileWrapper = document.createElement("div");
  const $ProfileImageBox = document.createElement("div");
  const $ProfileImage = document.createElement("img");
  const $ProfileInfoBox = document.createElement("div");
  const $ProfileNameBox = document.createElement("div");
  const $ProfileName = document.createElement("div");
  const $ProfileBtnBox = document.createElement("div");

  $ProfileWrapper.id = "profileWrapper";
  $ProfileWrapper.appendChild($ProfileImageBox);
  $ProfileWrapper.appendChild($ProfileInfoBox);
  $ProfileInfoBox.classList.add("profileInfoBox");
  $ProfileImageBox.appendChild($ProfileImage);
  $ProfileInfoBox.appendChild($ProfileNameBox);
  $ProfileNameBox.classList.add("mainProfileNameBox");
  $ProfileNameBox.appendChild($ProfileName);
  $ProfileName.classList.add("mainProfileName");
  $ProfileName.innerHTML = user.nickname;
  $ProfileNameBox.appendChild($ProfileBtnBox);
  $ProfileBtnBox.id = "profileBtnBox";
  if (isMe) $ProfileBtnBox.appendChild(MyBtn());
  else $ProfileBtnBox.appendChild(OtherBtn(id, user.relation));
  $ProfileInfoBox.appendChild(
    GameCount({
      total: user.game_count,
      win: user.win_count,
      lose: user.lose_count,
    })
  );
  $ProfileInfoBox.appendChild(
    PercentBar({ win: user.win_count, lose: user.lose_count })
  );
  $ProfileImageBox.classList.add("profileImageBox");
  $ProfileImage.classList.add("profileImage");
  $ProfileImage.setAttribute("src", "/src/images/none_profile.png"); //profile image path
  $ProfileImage.setAttribute("alt", "profile_image");

  return $ProfileWrapper;
}
