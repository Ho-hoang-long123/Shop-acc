const fetch = require('node-fetch');
const crypto = require('crypto');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ status: 405, message: 'Method Not Allowed' });
  }

  let body = req.body || {};
  if (typeof body === 'string' && body.trim() !== '') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      try {
        const parsed = new URLSearchParams(body);
        body = Object.fromEntries(parsed.entries());
      } catch (err) {}
    }
  }

  const { telco, code, serial, amount, request_id } = body;

  if (!code || !serial) {
    return res.json({ status: 100, message: 'Proxy lỗi: Thiếu mã thẻ hoặc seri' });
  }

  // --- THÔNG TIN TÀI KHOẢN GACHTHE1S CỦA BẠN ---
  const partner_id = '40469308254';
  const partner_key = '0b4616c5b4a4d5f9fa38473041c0acd0';
  const command = 'charging';

  // Cách tạo chữ ký chuẩn: partner_key + code + serial
  // (Nếu API gachthe1s đổi chuẩn, ta nối chuỗi theo đúng tài liệu tích hợp của họ)
  const rawSign = partner_key + code + serial;
  const sign = crypto.createHash('md5').update(rawSign).digest('hex');

  const params = new URLSearchParams({
    telco: telco,
    code: code,
    serial: serial,
    amount: amount,
    request_id: request_id,
    partner_id: partner_id,
    sign: sign,
    command: command
  });

  try {
    const response = await fetch('https://gachthe1s.com/chargingws/v2', {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const data = await response.text();
    return res.status(200).send(data);
  } catch (error) {
    return res.status(500).json({ status: 500, message: 'Proxy Error: ' + error.message });
  }
};
