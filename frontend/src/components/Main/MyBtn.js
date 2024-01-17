export default function MyBtn() {
  const $MyBtnWrapper = document.createElement("div");
  const $ProfileEditBtn = document.createElement("button");

  $MyBtnWrapper.classList.add("btnWrapper");
  $MyBtnWrapper.appendChild($ProfileEditBtn);
  $ProfileEditBtn.classList.add("mainBtn");
  $ProfileEditBtn.innerHTML = "프로필 편집";

  return $MyBtnWrapper;
}
