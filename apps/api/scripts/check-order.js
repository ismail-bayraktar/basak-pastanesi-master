import mongoose from 'mongoose';

const orderId = process.argv[2] || '691748ecf8d30ab3f8bf1d84';

mongoose.connect('mongodb://localhost:27017/ecommerce')
  .then(() => {
    const orderSchema = new mongoose.Schema({}, { strict: false });
    const Order = mongoose.model('Order', orderSchema, 'orders');

    return Order.findById(orderId);
  })
  .then(order => {
    if (!order) {
      console.log('❌ Sipariş bulunamadı:', orderId);
      process.exit(1);
    }

    console.log('\n📋 Sipariş Bilgileri:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Order ID:', order._id);
    console.log('  Status:', order.status);
    console.log('  Branch ID:', order.branchId || '❌ ATANMAMIŞ');
    console.log('  Branch Code:', order.branchCode || '❌ YOK');
    console.log('  Courier Status:', order.courierStatus);
    console.log('  Customer Name:', order.address?.name || 'N/A');
    console.log('  Delivery Address:', order.address?.address || order.address);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (!order.branchId) {
      console.log('\n⚠️  UYARI: Bu siparişe branch ataması yapılmamış!');
      console.log('   Kurye gönderimi için önce branch ataması gerekli.\n');
    }

    if (order.status !== 'Hazırlanıyor') {
      console.log('\n⚠️  UYARI: Sipariş durumu "Hazırlanıyor" değil!');
      console.log('   Mevcut durum:', order.status);
      console.log('   Kurye gönderimi için durum "Hazırlanıyor" olmalı.\n');
    }

    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Hata:', err.message);
    process.exit(1);
  });
