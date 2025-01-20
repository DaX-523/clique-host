const MAX_LENGTH = 6;
export default function generate() {
  const substring =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < MAX_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * substring.length);
    id += substring[randomIndex];
  }
  return id;
}
