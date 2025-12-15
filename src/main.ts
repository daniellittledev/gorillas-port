import "./style.css";
import { GameController } from "./controller";

const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
if (!canvas) {
  throw new Error("Canvas element not found");
}

const controller = new GameController(canvas);
controller.start();

console.log(
  "🦍 GORILLAS game loaded! Use angle and velocity to fire bananas at your opponent!"
);
