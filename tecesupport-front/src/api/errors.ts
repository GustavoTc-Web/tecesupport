import axios from "axios";

function findFirstMessage(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = findFirstMessage(item);

      if (message) {
        return message;
      }
    }
  }

  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      const message = findFirstMessage(item);

      if (message) {
        return message;
      }
    }
  }

  return null;
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  if (!error.response) {
    return "Não foi possível conectar ao servidor. Tente novamente.";
  }

  return findFirstMessage(error.response.data) ?? fallback;
}
