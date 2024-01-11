export default function SubmitButton(text) {
  const $SubmitButton = document.createElement("div");
  $SubmitButton.classList.add("submitButton");
  $SubmitButton.innerHTML = text;
  //todo: 계정 만들기 버튼 클릭 시 회원가입 기능 구현

  return $SubmitButton;
}
