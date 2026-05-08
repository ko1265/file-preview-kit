export function createContainer(className: string): HTMLDivElement {
  const container = document.createElement("div");
  container.className = className;
  return container;
}

export function createMessageCard(title: string, description: string): HTMLElement {
  const wrapper = createContainer("fpk-message");
  const heading = document.createElement("strong");
  heading.textContent = title;
  const body = document.createElement("p");
  body.textContent = description;
  wrapper.append(heading, body);
  return wrapper;
}

export function createSectionTitle(text: string): HTMLElement {
  const title = document.createElement("h3");
  title.className = "fpk-section-title";
  title.textContent = text;
  return title;
}

export function createParagraph(text: string): HTMLParagraphElement {
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  return paragraph;
}

