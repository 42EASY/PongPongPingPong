export default function SubmitButton(text) {
  const $submitButton = document.createElement("div");
  $submitButton.classList.add("submitButton");
  $submitButton.innerHTML = text;
  //todo: 계정 만들기 버튼 클릭 시 회원가입 기능 구현

  return $submitButton;
}
