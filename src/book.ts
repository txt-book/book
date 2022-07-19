export function createBook(content: string, el: HTMLElement | string) {
  const cfg = {
    fontSize: 16,
    lineHeight: 1.5,
  };
  const eventListeners: Record<Event, EventListener<any>[]> = {
    locationChanged: [],
  };

  const container =
    typeof el === "string"
      ? (document.querySelector(el) as HTMLDivElement)
      : el;
  const paper = document.createElement("div");
  paper.addEventListener("click", (e) => {
    if (e.clientX > paper.clientWidth / 2) {
      nextPage();
    } else {
      prevPage();
    }
  });
  paper.style.width = "90vw";
  paper.style.fontSize = `${cfg.fontSize}px`;
  paper.style.lineHeight = `${cfg.lineHeight}em`;
  paper.style.wordBreak = "break-word";

  container.appendChild(paper);

  let start = 0;
  let lastLength = 0;

  function getHeight() {
    return (
      Math.floor(container.clientHeight / (cfg.fontSize * cfg.lineHeight)) *
      (cfg.fontSize * cfg.lineHeight)
    );
  }

  function measureLength(start: number): number {
    const measurePaper = paper;
    const lastColor = measurePaper.style.color;
    measurePaper.style.color = "transparent";

    const height = getHeight();
    console.log(height);
    let length = lastLength;
    let lastHeight = 0;

    while (true) {
      render(buildContent(content, { start, length }), measurePaper);
      if (measurePaper.clientHeight <= height) {
        if (lastHeight > height) {
          break;
        }
        length += 10;
      } else {
        lastHeight = measurePaper.clientHeight;
        length -= 1;
      }
    }

    measurePaper.style.color = lastColor;

    return length;
  }

  function setConfig(config: Config): void {
    start = config.start ?? start;
    cfg.fontSize = config.fontSize ?? cfg.fontSize;
    paper.style.fontSize = `${cfg.fontSize}px`;
    nextPage();
  }

  function prevPage(): void {
    if (start < 0) {
      return;
    }
    const page = { start: start, length: measureLength(start) };
    render(buildContent(content, page), paper);
    emit("locationChanged", { startIndex: page.start });
    start = start - page.length;
  }

  function nextPage(): void {
    if (start >= content.length) {
      return;
    }
    const page = { start: start, length: measureLength(start) };
    render(buildContent(content, page), paper);
    emit("locationChanged", { startIndex: page.start });
    start = start + page.length;
  }

  function emit(event: Event, data: EventData<Event>) {
    eventListeners[event].forEach((callback) => callback(data));
  }

  function on<T extends Event>(event: T, callback: EventListener<T>) {
    eventListeners[event].push(callback);
  }

  return { prevPage, nextPage, setConfig, on };
}

function render(content: string, paper: HTMLDivElement) {
  paper.innerHTML = content;
}

function buildContent(content: string, page: Page): string {
  return content
    .slice(page.start, page.start + page.length)
    .replaceAll(" ", "&nbsp;")
    .replaceAll("\n", "<br>");
}

type Event = "locationChanged";

type EventData<T extends Event> = {
  locationChanged: { startIndex: number };
}[T];

interface EventListener<T extends Event> {
  (data: EventData<T>): void;
}

interface Page {
  start: number;
  length: number;
}

interface Config {
  fontSize?: number;
  start?: number;
}
