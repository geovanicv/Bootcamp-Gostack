import { call, select, put, all, takeLatest } from 'redux-saga/effects';
import { toast } from 'react-toastify';

import api from '../../../services/api';

import { addToCartSuccess, updateAmount } from './actions';
import { formatPrice } from '../../../util/format';

function* addToCart({ id }) {
  // acessa api, busca detalhes e cadastra - interceptor da action

  // verificar se o produto ja nao está no carrinho - select
  const productExists = yield select(state =>
    state.cart.find(p => p.id === id)
  );

  // verificando stoque
  const stock = yield call(api.get, `/stock/${id}`);
  const stockAmount = stock.data.amount;
  const currentAmount = productExists ? productExists.amount : 0;

  const amount = currentAmount + 1;

  if (amount > stockAmount) {
    toast.error('Quantidade fora de estoque!');
    return;
  }

  if (productExists) {
    yield put(updateAmount(id, amount));
  } else {
    const response = yield call(api.get, `/products/${id}`);

    const data = {
      ...response.data,
      amount: 1,
      priceFormatted: formatPrice(response.data.price),
    };

    yield put(addToCartSuccess(data));
  }
}

// isso ouve todas as actions, quando for @cart/ADD_REQUEST ele executa a addToCart
export default all([takeLatest('@cart/ADD_REQUEST', addToCart)]);
