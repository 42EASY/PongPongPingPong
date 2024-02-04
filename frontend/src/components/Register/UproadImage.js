export default function UproadImage(image) {
  const $uproadImageWrapper = document.createElement("div");
  $uproadImageWrapper.classList.add("uproadImageWrapper");

  const $previewImage = document.createElement("img");
  $previewImage.classList.add("previewImage");
  $previewImage.setAttribute("src", image);
  $previewImage.setAttribute("alt", "프로필 이미지");

  const $uproadImageInput = document.createElement("input");
  $uproadImageInput.classList.add("uproadImageInput");
  $uproadImageInput.setAttribute("type", "file");
  $uproadImageInput.setAttribute("accept", "image/jpg, image/jpeg, image/png");

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

  $uproadImageButton.appendChild($uproadImageIcon);
  $uproadImageButton.appendChild($uproadImageText);

  $uproadImageWrapper.appendChild($previewImage);
  $uproadImageWrapper.appendChild($uproadImageInput);
  $uproadImageWrapper.appendChild($uproadImageButton);
  $uproadImageWrapper.appendChild($uproadImageNotice);

  $uproadImageButton.addEventListener("click", () => {
    $uproadImageInput.click();
  });

  //이미지 미리보기
  $uproadImageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      $previewImage.setAttribute("src", e.target.result);
    };

    reader.readAsDataURL(file);
  });

  return $uproadImageWrapper;
}
