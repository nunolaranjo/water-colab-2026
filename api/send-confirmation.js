export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) return res.status(500).json({ error: "Missing API key" });

  const { email, nome, cargo, entidade, morada, codigo_postal, nif, tipo_inscricao, requisicao, lang } = req.body;

  if (!email || !nome) return res.status(400).json({ error: "Missing required fields" });

  const isMembro = tipo_inscricao === "membro_140";
  const tipoLabel = isMembro ? "Membro — € 140" : "Não Membro — € 170";
  const tipoLabelEN = isMembro ? "Member — € 140" : "Non-Member — € 170";
  const reqLabel = requisicao === "sim" ? "Sim" : "Não";
  const isPT = lang !== "en";

  // ── Email 1: Confirmation to registrant ──
  const confirmSubject = isPT
    ? "Water Co-Lab 2026 — Confirmação de Inscrição"
    : "Water Co-Lab 2026 — Registration Confirmation";

  const confirmHTML = isPT
    ? `<div style="font-family:Arial,sans-serif;color:#1A3C6E;max-width:600px;margin:0 auto;">
        <h2 style="color:#1A3C6E;margin-bottom:4px;">Water Co-Lab 2026</h2>
        <p style="color:#00B0A0;margin-top:0;font-size:14px;">Confirmação de Inscrição</p>
        <hr style="border:none;border-top:2px solid #00B0A0;margin:16px 0;">
        <p>Caro/a ${nome},</p>
        <p>A sua inscrição no Water Co-Lab 2026 foi registada com sucesso.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:6px 12px;color:#666;">Nome</td><td style="padding:6px 12px;font-weight:bold;">${nome}</td></tr>
          <tr style="background:#f5f7fa;"><td style="padding:6px 12px;color:#666;">Entidade</td><td style="padding:6px 12px;font-weight:bold;">${entidade}</td></tr>
          <tr><td style="padding:6px 12px;color:#666;">Tipo</td><td style="padding:6px 12px;font-weight:bold;">${tipoLabel}</td></tr>
        </table>
        <p>Para concluir a inscrição, agradecemos a transferência para:</p>
        <p style="background:#f5f7fa;padding:12px;border-left:3px solid #00B0A0;font-size:15px;">
          <strong>IBAN:</strong> PT50 0036 0282 9910 0000 4255 3<br>
          Envie o comprovativo para <a href="mailto:geral@apda.pt" style="color:#00B0A0;">geral@apda.pt</a>
        </p>
        <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
        <p><strong>Data:</strong> 18 de junho de 2026<br>
        <strong>Local:</strong> Inatel Caparica, Costa da Caparica</p>
        <p>A APDA entrará em contacto após a receção do comprovativo de pagamento.</p>
        <p style="margin-top:24px;">Com os melhores cumprimentos,<br>
        <strong>Organização Water Co-Lab 2026 — APDA</strong></p>
      </div>`
    : `<div style="font-family:Arial,sans-serif;color:#1A3C6E;max-width:600px;margin:0 auto;">
        <h2 style="color:#1A3C6E;margin-bottom:4px;">Water Co-Lab 2026</h2>
        <p style="color:#00B0A0;margin-top:0;font-size:14px;">Registration Confirmation</p>
        <hr style="border:none;border-top:2px solid #00B0A0;margin:16px 0;">
        <p>Dear ${nome},</p>
        <p>Your registration for Water Co-Lab 2026 has been successfully recorded.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:6px 12px;color:#666;">Name</td><td style="padding:6px 12px;font-weight:bold;">${nome}</td></tr>
          <tr style="background:#f5f7fa;"><td style="padding:6px 12px;color:#666;">Organisation</td><td style="padding:6px 12px;font-weight:bold;">${entidade}</td></tr>
          <tr><td style="padding:6px 12px;color:#666;">Type</td><td style="padding:6px 12px;font-weight:bold;">${tipoLabelEN}</td></tr>
        </table>
        <p>To complete your registration, please transfer the fee to:</p>
        <p style="background:#f5f7fa;padding:12px;border-left:3px solid #00B0A0;font-size:15px;">
          <strong>IBAN:</strong> PT50 0036 0282 9910 0000 4255 3<br>
          Send proof of transfer to <a href="mailto:geral@apda.pt" style="color:#00B0A0;">geral@apda.pt</a>
        </p>
        <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
        <p><strong>Date:</strong> 18 June 2026<br>
        <strong>Venue:</strong> Inatel Caparica, Costa da Caparica</p>
        <p>APDA will be in touch after receiving proof of payment.</p>
        <p style="margin-top:24px;">Kind regards,<br>
        <strong>Water Co-Lab 2026 Organisation — APDA</strong></p>
      </div>`;

  // ── Email 2: Notification to APDA ──
  const notifyHTML = `<div style="font-family:Arial,sans-serif;color:#333;max-width:600px;">
    <h3 style="color:#1A3C6E;">Nova inscrição — Water Co-Lab 2026</h3>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:6px 12px;color:#666;width:180px;">Nome</td><td style="padding:6px 12px;">${nome}</td></tr>
      <tr style="background:#f5f7fa;"><td style="padding:6px 12px;color:#666;">Email</td><td style="padding:6px 12px;"><a href="mailto:${email}">${email}</a></td></tr>
      <tr><td style="padding:6px 12px;color:#666;">Cargo</td><td style="padding:6px 12px;">${cargo}</td></tr>
      <tr style="background:#f5f7fa;"><td style="padding:6px 12px;color:#666;">Entidade</td><td style="padding:6px 12px;">${entidade}</td></tr>
      <tr><td style="padding:6px 12px;color:#666;">Morada</td><td style="padding:6px 12px;">${morada}, ${codigo_postal}</td></tr>
      <tr style="background:#f5f7fa;"><td style="padding:6px 12px;color:#666;">NIF</td><td style="padding:6px 12px;">${nif}</td></tr>
      <tr><td style="padding:6px 12px;color:#666;">Tipo</td><td style="padding:6px 12px;font-weight:bold;">${tipoLabel}</td></tr>
      <tr style="background:#f5f7fa;"><td style="padding:6px 12px;color:#666;">Requisição/NE</td><td style="padding:6px 12px;">${reqLabel}</td></tr>
    </table>
  </div>`;

  // ── Send both emails ──
  const sendEmail = (to, subject, html) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Water Co-Lab 2026 <noreply@watercolab.apda.pt>", to, subject, html })
    });

  try {
    const [r1, r2] = await Promise.all([
      sendEmail(email, confirmSubject, confirmHTML),
      sendEmail("geral@apda.pt", `Nova inscrição — Water Co-Lab 2026 — ${nome}`, notifyHTML)
    ]);

    if (!r1.ok || !r2.ok) {
      const e1 = await r1.text();
      const e2 = await r2.text();
      console.error("Resend errors:", e1, e2);
      return res.status(502).json({ error: "Email delivery failed" });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Send error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
