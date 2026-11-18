const fetch = require('node-fetch');
const crypto = require('crypto');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');

  if (req.method !== 'POST') {
    return res.status(405).json({ status: 405, message: 'Method Not Allowed' });
  }

  const { telco, code, serial, amount, request_id } = req.body || {};

  if (!code || !serial) {
    return res.json({ status: 100, message: 'Thiếu thông tin thẻ trên proxy' });
  }

  const partner_id = '40469308254';
  const partner_key = '0b4616c5b4a4d5f9fa38473041c0acd0';

  const sign = crypto.createHash('md5').update(partner_key + code + serial).digest('hex');

  const params = new URLSearchParams({
    telco: telco,
    code: code,
    serial: serial,
    amount: amount,
    request_id: request_id,
    partner_id: partner_id,
    sign: sign,
    command: 'charging'
  });

  try {
    const response = await fetch('https://gachthe1s.com/chargingws/v2', {
      method: 'POST',
      body: params
    });
    const data = await response.text();
    return res.status(200).send(data);
  } catch (error) {
    return res.status(500).json({ status: 500, message: 'Proxy Error: ' + error.message });
  }
};
