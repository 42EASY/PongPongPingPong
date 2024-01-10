export default function Email() {
  const $Email = document.createElement("div");
  $Email.classList.add("email");

  const $EmailText = document.createElement("div");
  $EmailText.classList.add("emailText");
  $EmailText.innerHTML = "이메일";

  const $EmailInput = document.createElement("div");
  $EmailInput.classList.add("emailPlace");
  $EmailText.innerHTML = "이메일 입력되는 부분";

  $Email.appendChild($EmailText);
  $Email.appendChild($EmailInput);

  return $Email;
}
