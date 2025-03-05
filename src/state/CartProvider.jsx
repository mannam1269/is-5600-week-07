import React, { useReducer, useContext } from 'react';

// Initialize the context
const CartContext = React.createContext();

// Define the default state
const initialState = {
  itemsById: {},
  allItems: [],
};

// Define reducer actions
const ADD_ITEM = 'ADD_ITEM';
const REMOVE_ITEM = 'REMOVE_ITEM';
const UPDATE_ITEM_QUANTITY = 'UPDATE_ITEM_QUANTITY';

// Define the reducer
const cartReducer = (state, action) => {
  const { payload } = action;

  switch (action.type) {
    case ADD_ITEM: {
      console.log({ state, action });

      const newState = {
        ...state,
        itemsById: {
          ...state.itemsById,
          [payload._id]: {
            ...payload,
            quantity: state.itemsById[payload._id]?.quantity + 1 || 1,
          },
        },
        allItems: Array.from(new Set([...state.allItems, payload._id])),
      };

      return newState;
    }

    case REMOVE_ITEM: {
      const { _id } = payload;
      const updatedItemsById = { ...state.itemsById };
      delete updatedItemsById[_id];

      return {
        ...state,
        itemsById: updatedItemsById,
        allItems: state.allItems.filter((itemId) => itemId !== _id),
      };
    }

    case UPDATE_ITEM_QUANTITY: {
      const { _id, quantity } = payload;
      const currentItem = state.itemsById[_id];

      if (!currentItem) return state; // Ensure item exists before updating

      return {
        ...state,
        itemsById: {
          ...state.itemsById,
          [_id]: {
            ...currentItem,
            quantity: Math.max(1, currentItem.quantity + quantity), // Ensure quantity is always >= 1
          },
        },
      };
    }

    default:
      return state;
  }
};

// Define the provider
const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Get all cart items
  const getCartItems = () => {
    return state.allItems.map((itemId) => state.itemsById[itemId]) ?? [];
  };

  // Get the total price of all items in the cart
  const getCartTotal = () => {
    return getCartItems().reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  // Add an item to the cart
  const addToCart = (product) => {
    dispatch({ type: ADD_ITEM, payload: product });
  };

  // Update the quantity of an item in the cart
  const updateItemQuantity = (productId, quantity) => {
    dispatch({ type: UPDATE_ITEM_QUANTITY, payload: { _id: productId, quantity } });
  };

  // Remove an item from the cart
  const removeFromCart = (product) => {
    dispatch({ type: REMOVE_ITEM, payload: product });
  };

  return (
    <CartContext.Provider
      value={{
        cartItems: getCartItems(),
        addToCart,
        updateItemQuantity,
        removeFromCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => useContext(CartContext);

export { CartProvider, useCart };
