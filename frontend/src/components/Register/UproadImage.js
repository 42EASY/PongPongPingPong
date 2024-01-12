export default function UproadImage() {
  const $UproadImageWrapper = document.createElement("div");
  $UproadImageWrapper.classList.add("uproadImageWrapper");

  const $PreviewImage = document.createElement("img");
  $PreviewImage.classList.add("previewImage");
  //todo: 이미지 업로드 시 미리보기 기능 구현
  $PreviewImage.setAttribute("src", "../../images/none_profile.png");
  $PreviewImage.setAttribute("alt", "프로필 이미지");

  const $UproadImageButton = document.createElement("div");
  $UproadImageButton.classList.add("uproadImageButton");

  const $UproadImageIcon = document.createElement("i");
  $UproadImageIcon.classList.add("bi", "bi-upload");

  const $UproadImageText = document.createElement("div");
  $UproadImageText.classList.add("uproadImageText");
  $UproadImageText.innerHTML = "이미지 업로드";

  const $UproadImageNotice = document.createElement("div");
  $UproadImageNotice.classList.add("uproadImageNotice");
  $UproadImageNotice.innerHTML =
    "10MB 이하의 jpg, jpeg, png 파일만 가능합니다.";
  //todo: 이미지 업로드 클릭이벤트 추가

  $UproadImageButton.appendChild($UproadImageIcon);
  $UproadImageButton.appendChild($UproadImageText);

  $UproadImageWrapper.appendChild($PreviewImage);
  $UproadImageWrapper.appendChild($UproadImageButton);
  $UproadImageWrapper.appendChild($UproadImageNotice);

  return $UproadImageWrapper;
}
