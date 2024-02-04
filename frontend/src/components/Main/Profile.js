import GameCount from "./GameCount.js";
import PercentBar from "../GameRoom/PercentBar.js";
import MyBtn from "./MyBtn.js";
import OtherBtn from "./OtherBtn.js";

export default function MyProfile() {
  const isMe = true; // true: myprofile, false: friend's profile

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
  $ProfileName.innerHTML = "someone";
  $ProfileNameBox.appendChild($ProfileBtnBox);
  $ProfileBtnBox.id = "profileBtnBox";
  if (isMe) $ProfileBtnBox.appendChild(MyBtn());
  else $ProfileBtnBox.appendChild(OtherBtn({ status: 0 }));
  $ProfileInfoBox.appendChild(GameCount({ total: 42, win: 42, lose: 42 }));
  $ProfileInfoBox.appendChild(PercentBar({ win: 25, lose: 75 }));
  $ProfileImageBox.classList.add("profileImageBox");
  $ProfileImage.classList.add("profileImage");
  $ProfileImage.setAttribute("src", ""); //profile image path
  $ProfileImage.setAttribute("alt", "profile_image");

  return $ProfileWrapper;
}
