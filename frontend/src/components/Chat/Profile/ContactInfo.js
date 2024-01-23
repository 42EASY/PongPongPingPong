export default function ContactInfo() {
  const $contactInfoWrapper = document.createElement("div");
  $contactInfoWrapper.classList.add("contactInfoWrapper");

  const $contactInfoTitle = document.createElement("div");
  $contactInfoTitle.classList.add("contactInfoTitle");
  $contactInfoTitle.innerHTML = "연락처 정보";

  const $contactInfo = document.createElement("div");
  $contactInfo.classList.add("contactInfo");

  const $contactInfoIconWrapper = document.createElement("div");
  $contactInfoIconWrapper.classList.add("contactInfoIconWrapper");
  const $contactInfoIcon = document.createElement("i");
  $contactInfoIcon.classList.add("bi", "bi-envelope");
  $contactInfoIconWrapper.appendChild($contactInfoIcon);

  const $contactInfoTextWrapper = document.createElement("div");
  $contactInfoTextWrapper.classList.add("contactInfoTextWrapper");
  const $contactInfoTextTitle = document.createElement("div");
  $contactInfoTextTitle.classList.add("contactInfoTextTitle");
  $contactInfoTextTitle.innerHTML = "이메일 주소";
  const $contactInfoText = document.createElement("a");
  $contactInfoText.classList.add("contactInfoText");
  $contactInfoText.setAttribute("href", "mailto:hahlee@student.42seoul.kr");
  $contactInfoText.innerHTML = "hahlee@student.42seoul.kr";
  $contactInfoTextWrapper.appendChild($contactInfoTextTitle);
  $contactInfoTextWrapper.appendChild($contactInfoText);

  $contactInfo.appendChild($contactInfoIconWrapper);
  $contactInfo.appendChild($contactInfoTextWrapper);

  $contactInfoWrapper.appendChild($contactInfoTitle);
  $contactInfoWrapper.appendChild($contactInfo);

  return $contactInfoWrapper;
}
