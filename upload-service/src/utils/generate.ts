import { substring } from "./constants";

const MAX_LENGTH = 6;
export default function generate() {
  let id = "";
  for (let i = 0; i < MAX_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * substring.length);
    id += substring[randomIndex];
  }
  return id;
}
