import changeUrl from "../../Router.js";

export default function MyBtn() {
  const $MyBtnWrapper = document.createElement("div");
  const $ProfileEditBtn = document.createElement("button");

  $MyBtnWrapper.classList.add("btnWrapper");
  $MyBtnWrapper.appendChild($ProfileEditBtn);
  $ProfileEditBtn.classList.add("mainBtn");
  $ProfileEditBtn.innerHTML = "프로필 편집";

  $ProfileEditBtn.addEventListener("click", () => {
    changeUrl("/register");
  });

  return $MyBtnWrapper;
}
