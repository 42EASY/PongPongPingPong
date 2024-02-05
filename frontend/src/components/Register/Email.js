export default function Email(email) {
  const $emailWrapper = document.createElement("div");
  $emailWrapper.classList.add("emailWrapper");

  const $emailText = document.createElement("div");
  $emailText.classList.add("emailText");
  $emailText.innerHTML = "이메일";

  const $emailContentWrapper = document.createElement("div");
  $emailContentWrapper.classList.add("emailContentWrapper");

  const $emailContent = document.createElement("div");
  $emailContent.classList.add("emailContent");

  const $emailIcon = document.createElement("i");
  $emailIcon.classList.add("bi", "bi-envelope-fill");
  const $emailContentText = document.createElement("div");
  $emailContentText.classList.add("emailContentText");
  $emailContentText.innerHTML = email;

  $emailContent.appendChild($emailIcon);
  $emailContent.appendChild($emailContentText);

  $emailContentWrapper.appendChild($emailContent);

  $emailWrapper.appendChild($emailText);
  $emailWrapper.appendChild($emailContentWrapper);

  return $emailWrapper;
}
