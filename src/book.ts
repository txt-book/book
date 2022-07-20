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

  const currentPage: Page = {
    start: 0,
    length: 0,
  };

  function getHeight() {
    return (
      Math.floor(container.clientHeight / (cfg.fontSize * cfg.lineHeight)) *
      (cfg.fontSize * cfg.lineHeight)
    );
  }

  function measureLength(start: number, direction: 1 | -1 = 1): number {
    const measurePaper = paper;
    const lastColor = measurePaper.style.color;
    measurePaper.style.color = "transparent";

    const height = getHeight();
    let length = currentPage.length;
    let lastHeight = 0;

    while (true) {
      render(
        buildContent(content, {
          start: direction === 1 ? start : start - length,
          length,
        }),
        measurePaper
      );
      if (measurePaper.clientHeight <= height) {
        if (lastHeight > height) {
          break;
        }
        if (direction === 1) {
          if (length === content.length - start) {
            break;
          }
          length = Math.min(length + 10, content.length - start);
        } else {
          if (length === start) {
            measurePaper.style.color = lastColor;
            return measureLength(0);
          }
          length = Math.min(length + 10, start);
        }
      } else {
        lastHeight = measurePaper.clientHeight;
        length -= 1;
      }
    }

    measurePaper.style.color = lastColor;

    return length;
  }

  function setConfig(config: Config): void {
    currentPage.start = config.start ?? currentPage.start;
    cfg.fontSize = config.fontSize ?? cfg.fontSize;
    paper.style.fontSize = `${cfg.fontSize}px`;

    currentPage.length = measureLength(currentPage.start);
    render(buildContent(content, currentPage), paper);
  }

  function prevPage(): void {
    if (currentPage.start <= 0) {
      return;
    }
    currentPage.length = measureLength(currentPage.start, -1);
    currentPage.start = Math.max(currentPage.start - currentPage.length, 0);
    render(buildContent(content, currentPage), paper);
    emit("locationChanged", { startIndex: currentPage.start });
  }

  function nextPage(): void {
    if (currentPage.start + currentPage.length >= content.length) {
      return;
    }
    currentPage.start = currentPage.start + currentPage.length;
    currentPage.length = measureLength(currentPage.start);
    render(buildContent(content, currentPage), paper);
    emit("locationChanged", { startIndex: currentPage.start });
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

function buildContent(content: string, page: Readonly<Page>): string {
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
