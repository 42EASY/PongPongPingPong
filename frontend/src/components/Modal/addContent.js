export default function addContentElement(content) {
  let $contentElement;

  switch (content.type) {
    case "i":
      $contentElement = document.createElement("i");
      break;
    case "text":
      $contentElement = document.createElement("div");
      $contentElement.innerHTML = content.text;
      $contentElement.classList.add("modalText");
      break;
    case "image":
      $contentElement = document.createElement("img");
      $contentElement.setAttribute("src", content.src);
      $contentElement.setAttribute("alt", content.alt);
      $contentElement.classList.add("modalImage");
      break;
    case "input":
      $contentElement = document.createElement("input");
      $contentElement.type = "text";
      $contentElement.name = content.name;
      $contentElement.placeholder = content.placeHolder;
      break;
    case "radio":
      $contentElement = document.createElement("label");
      const $radioBox = document.createElement("div");
      $radioBox.classList.add("radioBox");
      $contentElement.appendChild($radioBox);

      const $radioButton = document.createElement("input");
      $radioButton.type = "radio";
      $radioButton.name = content.name;
      $radioButton.value = content.text;
      $radioBox.appendChild($radioButton);

      const $label = document.createElement("label");
      $label.textContent = content.text;
      $radioBox.appendChild($label);

      if (content.explanation) {
        const $explanation = document.createElement("div");
        $explanation.classList.add("explanation");
        $explanation.innerHTML = content.explanation;
        $label.appendChild($explanation);
      }
      break;
    case "primaryButton":
    case "secondaryButton":
    case "singleButton":
      $contentElement = document.createElement("button");
      $contentElement.innerHTML = content.text;
      break;
    default:
      $contentElement = content;
  }
  if (content.class) $contentElement.className = content.class;
  if (content.id) $contentElement.id = content.id;
  return $contentElement;
}
