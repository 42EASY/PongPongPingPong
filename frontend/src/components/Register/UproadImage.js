export default function UproadImage() {
  const $UproadImage = document.createElement("div");
  $UproadImage.classList.add("uproadImage");

  const $PreviewImage = document.createElement("div");
  $PreviewImage.classList.add("previewImage");
  $PreviewImage.innerHTML = "이미지 미리보기";

  const $UproadImageText = document.createElement("div");
  $UproadImageText.classList.add("uproadImageText");
  $UproadImageText.innerHTML = "이미지 업로드";

  $UproadImage.appendChild($PreviewImage);
  $UproadImage.appendChild($UproadImageText);

  return $UproadImage;
}
