function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Variable d'environnement manquante: ${name}.\n` +
        `Copiez .env.example vers .env.local et renseignez-la.`
    );
  }
  return value;
}

export const env = {
  // Server-side only (Server Actions) — never expose to the client.
  get anthropicApiKey() {
    return required("ANTHROPIC_API_KEY", process.env.ANTHROPIC_API_KEY);
  },
};
