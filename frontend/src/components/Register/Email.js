export default function Email() {
  const $EmailWrapper = document.createElement("div");
  $EmailWrapper.classList.add("emailWrapper");

  const $EmailText = document.createElement("div");
  $EmailText.classList.add("emailText");
  $EmailText.innerHTML = "이메일";

  const $EmailContentWrapper = document.createElement("div");
  $EmailContentWrapper.classList.add("emailContentWrapper");

  const $EmailContent = document.createElement("div");
  $EmailContent.classList.add("emailContent");

  const $EmailIcon = document.createElement("i");
  $EmailIcon.classList.add("bi", "bi-envelope-fill");
  const $EmailContentText = document.createElement("div");
  $EmailContentText.classList.add("emailContentText");
  $EmailContentText.innerHTML = "test@gmail.com";

  $EmailContent.appendChild($EmailIcon);
  $EmailContent.appendChild($EmailContentText);

  $EmailContentWrapper.appendChild($EmailContent);

  $EmailWrapper.appendChild($EmailText);
  $EmailWrapper.appendChild($EmailContentWrapper);

  return $EmailWrapper;
}
