export const CART_COMMAND_SERVICE = 'CART_COMMAND_SERVICE';

export const CartServiceCommand = {
  getAll: 'cart.admin.getAll',
  getByUuid: 'cart.admin.getByUuid',
  add: 'cart.admin.item.add',
  setQuantity: 'cart.admin.item.setQuantity',
  remove: 'cart.admin.item.remove',
} as const;
