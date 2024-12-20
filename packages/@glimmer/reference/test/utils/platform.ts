// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function objectValues(obj: any) {
  if (typeof Object.values === 'function') {
    return Object.values(obj);
  } else {
    return Object.keys(obj).map((k) => obj[k]);
  }
}
