import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/navigation';

async function getOrder(orderId) {
  const prisma = new PrismaClient();

  const order = await prisma.orders.findUnique({
    where: { 
      id: orderId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    redirect('/404');
  }

  return order;
}

export default async function OrderConfirmation({ params }) {
  const order = await getOrder(params.id);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <h1 className="text-lg font-semibold">Order Confirmed!</h1>
          <p>Thank you for your purchase. Order ID: {order.id}</p>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold">Order Details</h2>
          
          {order.items.map((item) => (
            <div key={item.id} className="border-b pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}

          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}