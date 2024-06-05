export function waitforme(milisec: number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve("");
    }, milisec);
  });
}
