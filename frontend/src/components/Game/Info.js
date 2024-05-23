export default function Info(leftInfo, rightInfo) {
  const $infoWrapper = document.createElement("div");
  const $leftBox = document.createElement("div");
  const $leftProfileImage = document.createElement("img");
  const $leftName = document.createElement("div");
  const $versus = document.createElement("div");
  const $rightBox = document.createElement("div");
  const $rightProfileImage = document.createElement("img");
  const $rightName = document.createElement("div");

  $leftProfileImage.setAttribute("src", leftInfo.image_url);
  $leftProfileImage.setAttribute("alt", "profile image");
  $rightProfileImage.setAttribute("src", rightInfo.image_url);
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

  $leftName.innerHTML = leftInfo.nickname;
  $versus.innerHTML = "vs";
  $rightName.innerHTML = rightInfo.nickname;

  return $infoWrapper;
}
