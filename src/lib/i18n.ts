export type Lang = "es" | "en";

export const t = (lang: Lang) => {
  const isES = lang === "es";
  return {
    appName: process.env.NEXT_PUBLIC_SITE_NAME ?? "Fabricio Farewell Wall 🫂",
    subtitle: isES
      ? "Deja un mensaje de despedida ✨"
      : "Leave a farewell message ✨",
    write: isES ? "Escribe tu mensaje" : "Write your message",
    name: isES ? "Tu nombre *" : "Your name *",
    message: isES ? "Mensaje (opcional)" : "Message (optional)",
    photo: isES ? "Foto (opcional)" : "Photo (optional)",
    mood: isES ? "Modo" : "Mood",
    send: isES ? "Enviar" : "Send",
    sending: isES ? "Enviando..." : "Sending...",
    thanksTitle: isES ? "¡Gracias!" : "Thank you!",
    thanksBody: isES
      ? "Tu mensaje ya está en el wall."
      : "Your message is now on the wall.",
    newest: isES ? "Más recientes" : "Newest",
    top: isES ? "Top (reacciones)" : "Top (reactions)",
    search: isES ? "Buscar por nombre o texto..." : "Search by name or text...",
    filtersAll: isES ? "Todos" : "All",
    admin: isES ? "Admin" : "Admin",
    hidden: isES ? "Ocultos" : "Hidden",
    show: isES ? "Mostrar" : "Show",
    hide: isES ? "Ocultar" : "Hide",
    secret: isES ? "Clave admin" : "Admin secret",
    enter: isES ? "Entrar" : "Enter",
    badSecret: isES ? "Clave incorrecta." : "Wrong secret.",
    emptyGuard: isES
      ? "Escribe al menos un mensaje o sube una foto."
      : "Write at least a message or upload a photo.",
    nameGuard: isES ? "Tu nombre es obligatorio." : "Name is required.",
    tooFast: isES ? "Espera un poquito antes de enviar otro 🙏" : "Please wait a bit before sending another 🙏",
  };
};

export const moodLabels = (lang: Lang) => ({
  funny: lang === "es" ? "Gracioso" : "Funny",
  emotional: lang === "es" ? "Emocional" : "Emotional",
  advice: lang === "es" ? "Consejo" : "Advice",
  memory: lang === "es" ? "Recuerdo" : "Memory",
  short: lang === "es" ? "Corto" : "Short",
});
