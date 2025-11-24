import logger from '../utils/logger.js';

/**
 * Print Service for Courier Receipts
 * Generates thermal printer-formatted HTML for courier delivery receipts
 */
class PrintService {
  /**
   * Generate courier receipt HTML
   * @param {object} order - Order data
   * @returns {string} HTML content for printing
   */
  generateCourierReceipt(order) {
    const {
      _id,
      orderNumber,
      address,
      phone,
      items = [],
      amount,
      paymentMethod,
      giftNote,
      courierTrackingId,
      courierIntegration,
      createdAt
    } = order;

    // Format date
    const orderDate = new Date(createdAt).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Customer info - handle different address formats
    let customerName, customerPhone, deliveryAddress;

    if (typeof address === 'string') {
      // Simple string address
      customerName = 'Müşteri';
      customerPhone = phone || '';
      deliveryAddress = address;
    } else if (address && typeof address === 'object') {
      // Object address
      customerName = address.name || address.firstName || 'Müşteri';
      customerPhone = address.phone || phone || '';
      deliveryAddress = address.address || address.street || JSON.stringify(address);
    } else {
      // Fallback
      customerName = 'Müşteri';
      customerPhone = phone || '';
      deliveryAddress = 'Adres bilgisi mevcut değil';
    }

    // Courier info (if assigned)
    const courierName = courierIntegration?.courierName || '[Kurye atandıktan sonra]';
    const courierPhone = courierIntegration?.courierPhone || '[Kurye telefonu]';

    // Format items
    const itemsHtml = items.map(item => {
      const itemTotal = (item.quantity || 1) * (item.price || 0);
      return `${item.quantity}x ${item.name.padEnd(24)}${itemTotal.toFixed(2).padStart(10)} TL`;
    }).join('\n');

    // Payment status
    const paymentStatus = order.payment ? 'ÖDENDİ' : 'ÖDENMEDİ';

    const receiptHtml = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kurye Fişi #${orderNumber || _id}</title>
  <style>
    @media print {
      @page {
        size: 80mm auto;
        margin: 0;
      }

      body {
        margin: 0;
        padding: 0;
      }
    }

    body {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.4;
      width: 80mm;
      margin: 0 auto;
      padding: 5mm;
      background: white;
      color: black;
    }

    .receipt {
      width: 100%;
    }

    .center {
      text-align: center;
    }

    .bold {
      font-weight: bold;
    }

    .separator {
      border-bottom: 1px dashed #000;
      margin: 5px 0;
    }

    .double-separator {
      border-bottom: 2px solid #000;
      margin: 5px 0;
    }

    .header {
      text-align: center;
      margin-bottom: 10px;
    }

    .section {
      margin: 10px 0;
    }

    .item-line {
      white-space: pre;
    }

    .total {
      font-size: 14px;
      font-weight: bold;
      margin-top: 10px;
    }

    @media screen {
      body {
        background: #f0f0f0;
        padding: 20px;
      }

      .receipt {
        background: white;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        padding: 10mm;
      }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <!-- Header -->
    <div class="header">
      <div class="bold" style="font-size: 16px;">TULUMBAK</div>
      <div style="font-size: 11px;">KURYE TESLİMAT FİŞİ</div>
    </div>
    <div class="double-separator"></div>

    <!-- Order Info -->
    <div class="section">
      <div class="bold">Sipariş No: ${orderNumber || _id}</div>
      <div>Tarih: ${orderDate}</div>
    </div>
    <div class="separator"></div>

    <!-- Courier Info -->
    <div class="section">
      <div class="bold">KURYE BİLGİLERİ</div>
      <div>Kurye: ${courierName}</div>
      <div>Tel: ${courierPhone}</div>
      ${courierTrackingId ? `<div>Takip: ${courierTrackingId}</div>` : ''}
    </div>
    <div class="separator"></div>

    <!-- Delivery Address -->
    <div class="section">
      <div class="bold">TESLİMAT ADRESİ</div>
      <div>Müşteri: ${customerName}</div>
      <div>Tel: ${customerPhone}</div>
      <div style="margin-top: 5px;">${deliveryAddress}</div>
    </div>
    <div class="separator"></div>

    <!-- Order Items -->
    <div class="section">
      <div class="bold">SİPARİŞ İÇERİĞİ</div>
      <div class="item-line">${itemsHtml}</div>
    </div>
    <div class="separator"></div>

    <!-- Payment Info -->
    <div class="section">
      <div class="total">TOPLAM: ${amount.toFixed(2)} TL</div>
      <div>Ödeme: ${paymentMethod} (${paymentStatus})</div>
    </div>

    ${giftNote ? `
    <div class="separator"></div>
    <div class="section">
      <div class="bold">MÜŞTERİ NOTU:</div>
      <div>${giftNote}</div>
    </div>
    ` : ''}

    <div class="double-separator"></div>

    <!-- Footer -->
    <div class="center" style="margin-top: 10px;">
      <div style="font-size: 10px;">Afiyet olsun!</div>
      <div style="font-size: 9px; margin-top: 5px;">www.tulumbak.com</div>
    </div>
  </div>

  <script>
    // Auto-print when opened in new window
    if (window.matchMedia) {
      const mediaQueryList = window.matchMedia('print');
      mediaQueryList.addListener((mql) => {
        if (!mql.matches) {
          // After print, close window if opened via window.open
          if (window.opener) {
            window.close();
          }
        }
      });
    }

    // Print dialog on load
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 250);
    });
  </script>
</body>
</html>
    `;

    logger.debug('Courier receipt generated', {
      orderId: _id,
      orderNumber: orderNumber || _id
    });

    return receiptHtml.trim();
  }

  /**
   * Generate print preview URL for order
   * @param {string} orderId - Order ID
   * @returns {string} Print preview URL
   */
  getPrintUrl(orderId) {
    return `/api/orders/${orderId}/print`;
  }

  /**
   * Generate multiple receipts for batch printing
   * @param {Array} orders - Array of order objects
   * @returns {string} Combined HTML for multiple receipts
   */
  generateBatchReceipts(orders) {
    const receipts = orders.map(order => this.generateCourierReceipt(order));

    return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Toplu Fiş Yazdırma</title>
  <style>
    @media print {
      .page-break {
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  ${receipts.map((receipt, index) => `
    <div class="page-break">
      ${receipt}
    </div>
  `).join('\n')}
</body>
</html>
    `;
  }

  /**
   * Validate order data before printing
   * @param {object} order - Order object
   * @returns {object} Validation result
   */
  validateOrderForPrinting(order) {
    const errors = [];

    if (!order) {
      errors.push('Order data is missing');
      return { valid: false, errors };
    }

    if (!order._id && !order.orderNumber) {
      errors.push('Order ID or number is missing');
    }

    // Address can be either:
    // 1. Nested object: order.address.address (frontend format)
    // 2. Direct object: order.address (backend format)
    // 3. String: order.address (simple format)
    const hasAddress = order.address && (
      typeof order.address === 'string' || // Simple string address
      order.address.address || // Nested object
      (typeof order.address === 'object' && Object.keys(order.address).length > 0) // Direct object
    );

    if (!hasAddress) {
      errors.push('Delivery address is missing');
    }

    if (!order.items || order.items.length === 0) {
      errors.push('Order items are missing');
    }

    if (order.amount === undefined || order.amount === null) {
      errors.push('Order amount is missing');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
const printService = new PrintService();

export default printService;
