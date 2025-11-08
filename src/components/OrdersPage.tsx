import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Package, Calendar, MapPin, Loader } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { AccountLayout } from './AccountLayout';

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    product: string;
    imageUrls: string[];
    salePrice: number;
  };
}

interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  pincode: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
  deliveryTracking?: {
    status: string;
  };
}

export function OrdersPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await apiService.getOrders();
        if (response.success && response.data?.orders) {
          setOrders(response.data.orders);
        } else {
          setError(response.error || 'Failed to fetch orders');
        }
      } catch (err) {
        setError('An error occurred while fetching orders');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '#10b981';
      case 'PROCESSING':
        return '#3b82f6';
      case 'CONFIRMED':
        return '#8b5cf6';
      case 'PENDING':
        return '#f59e0b';
      case 'CANCELLED':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <AccountLayout>
        <LoadingContainer>
          <Loader size={48} className="animate-spin" />
          <p>Loading your orders...</p>
        </LoadingContainer>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <Content>
        <Header>
          <h1>My Orders</h1>
        </Header>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {orders.length === 0 ? (
          <EmptyState>
            <Package size={64} />
            <h2>No orders yet</h2>
            <p>You haven't placed any orders yet. Start shopping to see your orders here.</p>
            <Button onClick={() => navigate('/products')}>Browse Products</Button>
          </EmptyState>
        ) : (
          <OrdersList>
            {orders.map((order) => (
              <OrderCard key={order.id}>
                <OrderHeader>
                  <div>
                    <OrderNumber>Order #{order.orderNumber}</OrderNumber>
                    <OrderDate>
                      <Calendar size={16} />
                      {formatDate(order.createdAt)}
                    </OrderDate>
                  </div>
                  <StatusBadge statusColor={getStatusColor(order.status)}>
                    {order.status}
                  </StatusBadge>
                </OrderHeader>

                <OrderItems>
                  {order.items.map((item) => (
                    <OrderItemCard key={item.id}>
                      <ItemImage
                        src={item.product.imageUrls[0] || '/placeholder.png'}
                        alt={item.product.product}
                      />
                      <ItemDetails>
                        <ItemName>{item.product.product}</ItemName>
                        <ItemInfo>
                          Quantity: {item.quantity} × ₹{item.price.toFixed(2)}
                        </ItemInfo>
                      </ItemDetails>
                      <ItemTotal>₹{(item.price * item.quantity).toFixed(2)}</ItemTotal>
                    </OrderItemCard>
                  ))}
                </OrderItems>

                <OrderFooter>
                  <AddressInfo>
                    <MapPin size={16} />
                    <div>
                      <strong>Delivery Address:</strong>
                      <p>{order.shippingAddress}</p>
                      <p>Pincode: {order.pincode}</p>
                    </div>
                  </AddressInfo>
                  <OrderTotal>
                    <TotalLabel>Total Amount:</TotalLabel>
                    <TotalAmount>₹{order.totalAmount.toFixed(2)}</TotalAmount>
                  </OrderTotal>
                </OrderFooter>

                <ViewButton onClick={() => navigate(`/order-confirmation/${order.id}`)}>
                  View Order Details
                </ViewButton>
              </OrderCard>
            ))}
          </OrdersList>
        )}
      </Content>
    </AccountLayout>
  );
}

const Content = styled.div`
  max-width: 1200px;
  width: 100%;
`;

const Header = styled.div`
  margin-bottom: 30px;

  h1 {
    font-size: 32px;
    background: linear-gradient(to right, #f59e0b, #facc15);
    -webkit-background-clip: text;
    color: transparent;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;

  p {
    font-size: 18px;
    color: #666;
  }
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);

  svg {
    color: #f59e0b;
    margin-bottom: 20px;
  }

  h2 {
    font-size: 24px;
    margin-bottom: 10px;
    color: #333;
  }

  p {
    color: #666;
    margin-bottom: 30px;
  }
`;

const Button = styled.button`
  background: linear-gradient(to right, #f59e0b, #facc15);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;

  &:hover {
    opacity: 0.9;
  }
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const OrderCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 24px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f3f4f6;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const OrderNumber = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
`;

const OrderDate = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
`;

const StatusBadge = styled.span<{ statusColor: string }>`
  background: ${(props) => props.statusColor}20;
  color: ${(props) => props.statusColor};
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

const OrderItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const OrderItemCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
`;

const ItemImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const ItemInfo = styled.p`
  font-size: 14px;
  color: #666;
`;

const ItemTotal = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #333;
`;

const OrderFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-top: 20px;
  border-top: 2px solid #f3f4f6;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const AddressInfo = styled.div`
  display: flex;
  gap: 12px;
  flex: 1;

  svg {
    color: #f59e0b;
    margin-top: 4px;
  }

  div {
    flex: 1;
  }

  strong {
    display: block;
    margin-bottom: 4px;
    color: #333;
  }

  p {
    font-size: 14px;
    color: #666;
    margin: 2px 0;
  }
`;

const OrderTotal = styled.div`
  text-align: right;

  @media (max-width: 768px) {
    text-align: left;
    width: 100%;
  }
`;

const TotalLabel = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
`;

const TotalAmount = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #f59e0b;
`;

const ViewButton = styled.button`
  width: 100%;
  background: linear-gradient(to right, #f59e0b, #facc15);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;

  &:hover {
    opacity: 0.9;
  }
`;

