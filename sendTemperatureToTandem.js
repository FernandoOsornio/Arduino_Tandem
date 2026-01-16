//const fetch = require('node-fetch');
//import fetch from 'node-fetch';

// ================= CONFIGURACIÓN =================

// Webhook Tandem
const WEBHOOK_URL =
  'https://tandem.autodesk.com/api/v1/timeseries/models/urn:adsk.dtm:mfugXGwqQ1iv8mdUtFTGHg/webhooks/generic';

// Basic token (clientId:clientSecret en base64)
const BASIC_TOKEN = 'OmRUNkJQcV9hUXQtcTRMbFpoNTczRkE=';

// Stream de temperatura
const STREAM_ID = 'AQAAAOLJT-kKvUNphmtX7Y_fEr0AAAAA';

// ================= AUTENTICACIÓN APS =================

async function getAccessToken() {
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: 'data:write data:read'
  });

  const response = await fetch(
    `https://developer.api.autodesk.com/authentication/v2/token?${params}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${BASIC_TOKEN}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Error obteniendo token APS');
  }

  const data = await response.json();
  return data.access_token;
}

// ================= ENVÍO A TANDEM =================

async function sendTemperature(token, temperature) {
  const payload = [
    {
      id: STREAM_ID,
      temperature: temperature
    }
  ];

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error enviando a Tandem: ${text}`);
  }

  console.log('✔ Temperatura enviada:', temperature);
}

// ================= SIMULACIÓN =================

let temperatura = 25.0;

async function main() {
  const token = await getAccessToken();
  console.log('✔ Token APS obtenido');

  setInterval(async () => {
    // Variación ±1.6 °C
    const cambio = (Math.random() * 2 - 1) * 1.6;
    temperatura += cambio;
    temperatura = Math.min(Math.max(temperatura, 15), 35);

    const tempRedondeada = Number(temperatura.toFixed(1));

    console.log('Enviando temperatura:', tempRedondeada);
    await sendTemperature(token, tempRedondeada);

  }, 5000);
}

main().catch(err => console.error(err));
