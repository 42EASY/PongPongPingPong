export default function UproadImage() {
  const $UproadImage = document.createElement("div");
  $UproadImage.classList.add("uproadImage");

  const $PreviewImage = document.createElement("img");
  $PreviewImage.classList.add("previewImage");
  //todo: 이미지 업로드 시 미리보기 기능 구현
  $PreviewImage.setAttribute("src", "../../images/none_profile.png");
  $PreviewImage.setAttribute("alt", "프로필 이미지");

  const $TextArea = document.createElement("div");
  $TextArea.classList.add("textArea");

  const $UproadImageIcon = document.createElement("i");
  $UproadImageIcon.classList.add("bi", "bi-upload");

  const $UproadImageText = document.createElement("div");
  $UproadImageText.classList.add("uproadImageText");
  $UproadImageText.innerHTML = "이미지 업로드";
  //todo: 확장자 안내문구 및 파일크기 안내문구 추가
  //todo: 이미지 업로드 클릭이벤트 추가

  $TextArea.appendChild($UproadImageIcon);
  $TextArea.appendChild($UproadImageText);

  $UproadImage.appendChild($PreviewImage);
  $UproadImage.appendChild($TextArea);

  return $UproadImage;
}
