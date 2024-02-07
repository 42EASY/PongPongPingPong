import changeUrl from "../../Router.js";

export default function MyBtn(user) {
  const $MyBtnWrapper = document.createElement("div");
  const $ProfileEditBtn = document.createElement("button");

  $MyBtnWrapper.classList.add("btnWrapper");
  $MyBtnWrapper.appendChild($ProfileEditBtn);
  $ProfileEditBtn.classList.add("btn", "mainBtn");
  $ProfileEditBtn.innerHTML = "프로필 편집";

  $ProfileEditBtn.addEventListener("click", () => {
    changeUrl("/register", user);
  });

  return $MyBtnWrapper;
}
