import ContactInfo from "./ContactInfo.js";
import InfoButton from "./InfoBtn.js";
import { getUserInfo } from "../../../components/Main/UserApi.js";

export default async function Info(user) {
  const userInfo = await getUserInfo(user.user_id);
  console.log(userInfo);

  const $infoWrapper = document.createElement("div");
  $infoWrapper.classList.add("infoWrapper");

  const $infoProfileImg = document.createElement("img");
  $infoProfileImg.setAttribute("src", user.image_url);
  $infoProfileImg.setAttribute("alt", "profileImg");
  $infoProfileImg.classList.add("infoProfileImg");

  const $infoHeader = document.createElement("div");
  $infoHeader.classList.add("infoHeader");

  const $infoNameWrapper = document.createElement("div");
  $infoNameWrapper.classList.add("infoNameWrapper");
  const $infoName = document.createElement("div");
  $infoName.classList.add("infoName");
  $infoName.innerHTML = user.nickname;
  const $profileButton = document.createElement("div");
  $profileButton.classList.add("profileButton", "infoButton");
  const $profileButtonIcon = document.createElement("i");
  $profileButtonIcon.classList.add("bi", "bi-person-vcard");
  const $profileButtonText = document.createElement("div");
  $profileButtonText.classList.add("profileButtonText");
  $profileButtonText.innerHTML = "상세 프로필 보기";
  //todo: 상세 프로필 보기 버튼 클릭 시 상세 프로필로 이동
  $profileButton.appendChild($profileButtonIcon);
  $profileButton.appendChild($profileButtonText);
  $infoNameWrapper.appendChild($infoName);
  $infoNameWrapper.appendChild($profileButton);

  const $infoStatusWrapper = document.createElement("div");
  $infoStatusWrapper.classList.add("infoStatusWrapper");

  const $infoStatus = document.createElement("div");
  $infoStatus.classList.add("friendStatus");
  const $infoStatusText = document.createElement("div");
  $infoStatusText.classList.add("infoStatusText");
  var userStatusText;
  if (userInfo.result.status === "ONLINE") {
    $infoStatus.classList.add("online");
    userStatusText = "온라인";
  } else if (userInfo.result.status === "OFFLINE") {
    $infoStatus.classList.add("offline");
    userStatusText = "오프라인";
  }
  $infoStatusText.innerHTML = userStatusText;
  $infoStatusWrapper.appendChild($infoStatus);
  $infoStatusWrapper.appendChild($infoStatusText);

  const $infoButtonWrapper = InfoButton(userInfo.result);

  $infoHeader.appendChild($infoNameWrapper);
  $infoHeader.appendChild($infoStatusWrapper);
  $infoHeader.appendChild($infoButtonWrapper);

  $infoWrapper.appendChild($infoProfileImg);
  $infoWrapper.appendChild($infoHeader);

  const $contactInfo = ContactInfo();
  $infoWrapper.appendChild($contactInfo);

  return $infoWrapper;
}
