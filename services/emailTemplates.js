export function matchedEmail(jobId) {
  return {
    subject: "Byli jste propojeni na Pomi",
    html: `
      <p>Byli jste propojeni ohledně zakázky.</p>
      <p>
        <a href="https://pomi.pro/chat/${jobId}">
          Pokračovat v chatu
        </a>
      </p>
    `,
  };
}

export function completedEmail(jobId) {
  return {
    subject: "Zakázka dokončena – hodnocení",
    html: `
      <p>Zakázka byla označena jako dokončená.</p>
      <p>
        <a href="https://pomi.pro/dashboard">
          Přejít na hodnocení
        </a>
      </p>
    `,
  };
}

export function cancelledEmail(jobId) {
  return {
    subject: "Zakázka byla zrušena",
    html: `
      <p>Zakázka byla zrušena.</p>
      <p>
        <a href="https://pomi.pro/dashboard">
          Zobrazit přehled
        </a>
      </p>
    `,
  };
}
