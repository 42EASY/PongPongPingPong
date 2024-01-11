export default function Email() {
  const $Email = document.createElement("div");
  $Email.classList.add("email");

  const $EmailText = document.createElement("div");
  $EmailText.classList.add("emailText");
  $EmailText.innerHTML = "이메일";

  const $EmailInput = document.createElement("div");
  $EmailInput.classList.add("emailPlace");

  const $Emailblock = document.createElement("div");
  $Emailblock.classList.add("emailblock");

  const $EmailIcon = document.createElement("i");
  $EmailIcon.classList.add("bi", "bi-envelope-fill");
  const $EmailInputArea = document.createElement("div");
  $EmailInputArea.classList.add("emailInputArea");
  $EmailInputArea.innerHTML = "test@gmail.com";

  $Emailblock.appendChild($EmailIcon);
  $Emailblock.appendChild($EmailInputArea);

  $EmailInput.appendChild($Emailblock);

  $Email.appendChild($EmailText);
  $Email.appendChild($EmailInput);

  return $Email;
}
