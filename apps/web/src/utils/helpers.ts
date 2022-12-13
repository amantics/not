import { roles } from "@/utils/constants";

export function arrayOf<T>(type: T, length: number): T[] {
  return Array(length).fill(type);
}

export function pick<T extends object>(obj: T, keys: (keyof T)[]): Partial<T> {
  return keys.reduce((acc, key) => {
    acc[key] = obj[key];
    return acc;
  }, {} as Partial<T>);
}

export function genRef(length: number) {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
}

export function convertRolesToIndexes(wantedRoles: typeof roles) {
  return wantedRoles.reduce((acc, role) => {
    acc[roles.indexOf(role)] = false;
    return acc;
  }, {} as { [key: number]: boolean });
}

export function downloadFile(file: File) {
  // convert file to octet stream
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", file.name);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
