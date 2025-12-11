export function sleep(ms = 1000) {
  return new Promise((res) => setTimeout(res, ms));
}

export function getTimeOf(val: number) {
  const minute = Math.floor(val / 60);
  const second = val - minute * 60;

  return { second, minute };
}
