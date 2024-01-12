export default function UproadImage() {
  const $uproadImageWrapper = document.createElement("div");
  $uproadImageWrapper.classList.add("uproadImageWrapper");

  const $previewImage = document.createElement("img");
  $previewImage.classList.add("previewImage");
  //todo: 이미지 업로드 시 미리보기 기능 구현
  $previewImage.setAttribute("src", "./src/images/none_profile.png");
  console.log(window.location.pathname);
  $previewImage.setAttribute("alt", "프로필 이미지");

  const $uproadImageButton = document.createElement("div");
  $uproadImageButton.classList.add("uproadImageButton");

  const $uproadImageIcon = document.createElement("i");
  $uproadImageIcon.classList.add("bi", "bi-upload");

  const $uproadImageText = document.createElement("div");
  $uproadImageText.classList.add("uproadImageText");
  $uproadImageText.innerHTML = "이미지 업로드";

  const $uproadImageNotice = document.createElement("div");
  $uproadImageNotice.classList.add("uproadImageNotice");
  $uproadImageNotice.innerHTML =
    "10MB 이하의 jpg, jpeg, png 파일만 가능합니다.";
  //todo: 이미지 업로드 클릭이벤트 추가

  $uproadImageButton.appendChild($uproadImageIcon);
  $uproadImageButton.appendChild($uproadImageText);

  $uproadImageWrapper.appendChild($previewImage);
  $uproadImageWrapper.appendChild($uproadImageButton);
  $uproadImageWrapper.appendChild($uproadImageNotice);

  return $uproadImageWrapper;
}
