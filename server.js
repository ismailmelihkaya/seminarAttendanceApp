const express = require("express");
const exphbs = require("express-handlebars");
const { sql, config } = require("./db.js");
const path = require("path");
const app = express();
const PDFDocument = require("pdfkit");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// handlebars ayarı
const hbs = exphbs.create({
  helpers: {
    formatDate: function (datetime) {
      return new Date(datetime).toLocaleDateString("tr-TR");
    },
  },
});
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", "./views");

// Ana sayfa - tüm seminerleri listele
app.get("/", async (req, res) => {
  try {
    await sql.connect(config);
    const seminars = await sql.query(`SELECT * FROM Seminars`);
    res.render("home", { seminars: seminars.recordset });
  } catch (err) {
    console.error("Seminerleri Listelerken bir hata oluştu:", err);
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => console.log("Sunucu çalışıyor http://localhost:3000/"));

// Seminer detay
app.get("/seminar/:id", async (req, res) => {
  const seminarId = req.params.id;
  try {
    await sql.connect(config);

    // Semineri getir
    const seminarResult =
      await sql.query`SELECT * FROM seminars WHERE id = ${seminarId}`;
    const seminar = seminarResult.recordset[0];

    // Katılımcılar ve katılım durumu
    const participantsResult = await sql.query`
        SELECT p.id, p.name,
          CASE WHEN a.id IS NOT NULL THEN 1 ELSE 0 END AS attended
        FROM participants p
        LEFT JOIN attendance a
          ON p.id = a.participant_id AND a.seminar_id = ${seminarId}
      `;

    const participants = participantsResult.recordset;

    const total = participants.length;
    const attended = participants.filter((p) => p.attended).length;
    const attendanceRate =
      total > 0 ? ((attended / total) * 100).toFixed(1) : 0;

    res.render("seminar", {
      seminar,
      participants,
      attendanceRate,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// katılımcı etkinliğini kaydetme
app.post("/attendance", async (req, res) => {
  const { participantId, seminarId } = req.body;

  try {
    await sql.connect(config);

    // aynı kişi bu seminere kayıtlıysa tekrar ekleme

    const check = await sql.query(`
            SELECT * FROM attendance
            WHERE participant_id = ${participantId} AND seminar_id = ${seminarId}    
        `);

    if (check.recordset.length === 0) {
      await sql.query(`
                INSERT INTO attendance (participant_id, seminar_id)
                VALUES (${participantId}, ${seminarId})    
            `);
    }

    res.redirect(`/seminar/${seminarId}`);
  } catch (err) {
    console.error("Katılımcı etkinliğini kaydederken bir hata oluştu:", err);
    res.status(500).send(err.message);
  }
});

// katılım raporu oluşturma
app.get("/seminar/:id/stats", async (req, res) => {
  const seminarId = req.params.id;
  const format = req.query.format || "json";

  try {
    await sql.connect(config);

    const seminarResult =
      await sql.query`SELECT * FROM seminars WHERE id = ${seminarId}`;
    const seminar = seminarResult.recordset[0];

    const participantsResult = await sql.query`
      SELECT p.name,
        CASE WHEN a.id IS NOT NULL THEN 'Katıldı' ELSE 'Katılmadı' END AS status
      FROM participants p
      LEFT JOIN attendance a
        ON p.id = a.participant_id AND a.seminar_id = ${seminarId}
    `;
    const participants = participantsResult.recordset;

    if (format === "json") {
      return res.json({
        seminar,
        participants,
      });
    }

    // PDF oluştur
    const doc = new PDFDocument();
    doc.registerFont("trFont", "fonts/DejaVuSans.ttf");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=rapor_${seminar.id}.pdf`
    );
    doc.pipe(res);

    doc.font("trFont");
    doc.fontSize(18).text(`Seminer: ${seminar.title}`, { underline: true });
    doc.text(`Tarih: ${new Date(seminar.date).toLocaleDateString("tr-TR")}`);
    doc.moveDown();

    doc.fontSize(14).text("Katılımcı Raporu:");
    doc.moveDown();

    participants.forEach((p) => {
      doc.text(`• ${p.name} — ${p.status}`);
    });

    doc.end();
  } catch (err) {
    res.status(500).send(err.message);
  }
});
