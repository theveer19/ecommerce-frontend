import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  // Check if the product is on sale
  const isOnSale = product.originalPrice && product.originalPrice > product.price;

  return (
    <div style={{ border: '1px solid #ccc', margin: 10, padding: 10, width: 250, position: 'relative' }}>
      
      {/* Show offer badge */}
      {product.offerText && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          backgroundColor: 'red',
          color: 'white',
          padding: '2px 6px',
          fontSize: 12,
          borderRadius: 4,
        }}>
          {product.offerText}
        </div>
      )}

      {/* Show product image or default text */}
      {product.image_url && product.image_url.trim() !== '' ? (
        <img
          src={product.image_url}
          alt={product.name || 'Product'}
          style={{ width: '100%', height: 200, objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: 200,
            background: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontStyle: 'italic',
            color: '#999',
          }}
        >
          No Image
        </div>
      )}

      <h4>{product.name || 'Unnamed Product'}</h4>
      <p>{product.description}</p>

      {/* Show original price and discounted price */}
      {isOnSale ? (
        <p>
          <span style={{ textDecoration: 'line-through', color: 'gray' }}>₹{product.originalPrice}</span>{' '}
          <span style={{ color: 'green', fontWeight: 'bold' }}>₹{product.price}</span>
        </p>
      ) : (
        <p>₹{product.price}</p>
      )}

      <button onClick={() => addToCart(product)}>Add to Cart</button>
    </div>
  );
}
