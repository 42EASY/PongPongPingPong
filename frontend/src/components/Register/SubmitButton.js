export default function SubmitButton() {
  const $SubmitButton = document.createElement("button");
  $SubmitButton.classList.add("submitButton");
  $SubmitButton.innerHTML = "계정 만들기";

  return $SubmitButton;
}
