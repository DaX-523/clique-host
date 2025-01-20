export default function validate(url: string) {
  return /^(https:\/\/|git@)(github\.com)(:|\/)[\w\-]+\/[\w\-]+(\.git)?$/.test(
    url
  );
}
