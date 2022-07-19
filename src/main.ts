import "./style.css";
import ExampleTxt from "./example.txt";
import { createBook } from "./book";

fetch(ExampleTxt)
  .then((r) => r.text())
  .then((content) => {
    const book = createBook(content, "#app");
    book.on("locationChanged", (data) => console.log(data));
    book.nextPage();
  });
