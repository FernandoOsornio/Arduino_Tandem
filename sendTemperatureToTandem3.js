// ================= CONFIG =================

// URL de ingestión de tu stream individual (con stream secret incluido)
const STREAM_URL =
// 'https://:_9O6oDBbTVWvpaiq_6OU4Q@tandem.autodesk.com/api/v1/timeseries/models/urn:adsk.dtm:mfugXGwqQ1iv8mdUtFTGHg/streams/AQAAACgpEaLILE57qjNmm9E1HNgAAAAA';
  'https://:JUe5EzpMT4yZS-00HiNNJw@tandem.autodesk.com/api/v1/timeseries/models/urn:adsk.dtm:m9WWPLlrR5-zyhpC8fWkkQ/streams/AQAAAJkpUNuV00Kvh8rrdMEPz9wAAAAA';
  
// Extraemos el secreto del URL para el header Authorization
const urlParts = STREAM_URL.match(/https:\/\/:(.+)@/);
const STREAM_SECRET = urlParts ? urlParts[1] : null;

if (!STREAM_SECRET) {
  console.error('❌ No se pudo extraer el stream secret del URL');
  process.exit(1);
}

// ================= FUNCIONES =================
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function sendTemperature(temperature) {
  const payload = [
    {
      temperature: temperature,
      ts: Date.now(), // timestamp opcional
    },
  ];

  const authHeader = Buffer.from(`:${STREAM_SECRET}`).toString('base64');

  try {
    const res = await fetch(
      STREAM_URL.replace(`:${STREAM_SECRET}@`, ''), // quitamos el secreto del URL
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error enviando a Tandem: ${text}`);
    }

    console.log('✔ Temperatura enviada:', temperature);
  } catch (err) {
    console.error(err);
  }
}

// ================= SIMULACIÓN DE ARDUINO =================
let temperatura = 25.0; // temperatura inicial

setInterval(async () => {
  // Variación ±1.6°C cada 5 segundos
  const cambio = (Math.random() * 2 - 1) * 1.6;
  temperatura += cambio;
  temperatura = Math.min(Math.max(temperatura, 15), 35); // rango 15-35°C

  console.log('Simulación -> temperatura:', temperatura.toFixed(1), '°C');

  // Enviar datos a Tandem
  await sendTemperature(Number(temperatura.toFixed(1)));
}, 5000);
