<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f4ff; padding: 32px 16px; }
    .wrapper { max-width: 560px; margin: 0 auto; }
    .card { background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 40px rgba(100,120,255,0.12); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 40px 36px; text-align: center; }
    .header h1 { color: #fff; font-size: 28px; font-weight: 700; margin-bottom: 8px; }
    .header p { color: rgba(255,255,255,0.82); font-size: 15px; }
    .body { padding: 40px; }
    .qr-block { background: #f7f8ff; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 28px; }
    .qr-block img { width: 180px; height: 180px; border-radius: 12px; }
    .qr-block p { color: #6b7280; font-size: 13px; margin-top: 12px; }
    .info-row { display: flex; gap: 12px; margin-bottom: 12px; }
    .label { font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; min-width: 100px; }
    .value { font-size: 14px; color: #1f2937; }
    .btn { display: block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; text-decoration: none; text-align: center; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; margin: 28px 0 0; }
    .footer { padding: 20px 40px; background: #f9fafb; text-align: center; }
    .footer p { font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>🎓 Your Certificate</h1>
        <p>{{ $template_name }} — Ready to download & share</p>
      </div>
      <div class="body">
        <div class="qr-block">
          <img src="{{ $qr_code_url }}" alt="QR Code">
          <p>Scan this QR code to verify authenticity</p>
        </div>
        <div class="info-row">
          <span class="label">Recipient</span>
          <span class="value">{{ $recipient_name }}</span>
        </div>
        <div class="info-row">
          <span class="label">Certificate</span>
          <span class="value">{{ $template_name }}</span>
        </div>
        <div class="info-row">
          <span class="label">Token</span>
          <span class="value" style="font-family:monospace;font-size:12px">{{ $submission_token }}</span>
        </div>
        <a href="{{ $verify_url }}" class="btn">View & Verify Certificate →</a>
      </div>
      <div class="footer">
        <p>Powered by CertFlow • This certificate was generated automatically.</p>
      </div>
    </div>
  </div>
</body>
</html>