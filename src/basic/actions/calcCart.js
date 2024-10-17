import { appendChildren, createElement, getElementById } from '../../util/element.js';
import { CART_VIEW_ID, SUM_VIEW_ID } from '../../const/VIEW_ID.js';
import { PROD_LIST } from '../../const/PROD_LIST.js';
import plusPurchaseCount from '../../util/plusPurchaseCount.js';
import {
  BULK_PURCHASE_DISCOUNT_RATIO,
  PROD_FIFTH_DISCOUNT_RATIO,
  PROD_FIRST_DISCOUNT_RATIO,
  PROD_FOURTH_DISCOUNT_RATIO,
  PROD_SECOND_DISCOUNT_RATIO,
  PROD_THIRD_DISCOUNT_RATIO,
  TUESDAY_DISCOUNT_RATIO
} from '../../const/MASIC_NUMBER.js';

export default function calcCart() {
  const cartView = getElementById(CART_VIEW_ID);
  const itemViewsInCart = cartView.children;

  const { totalItemsPrice, paymentPrice, itemCount } = calculatePrices(itemViewsInCart);
  const discountRatio = calculateDiscountRatio(totalItemsPrice, paymentPrice, itemCount);

  const { finalPaymentPrice, highestDiscountRatio } = applyTuesdayDiscount(paymentPrice, discountRatio);
  updateSumView(finalPaymentPrice, highestDiscountRatio);

  // updateStockInfo();
  // renderBonusPts();
}

function calculatePrices(itemViewsInCart) {
  let totalItemsPrice = 0;
  let paymentPrice = 0;
  let itemCount = 0;

  for (let i = 0; i < itemViewsInCart.length; i++) {
    const currentItem = findProductById(itemViewsInCart[i].id);
    const quantity = plusPurchaseCount(itemViewsInCart[i]);
    const totalItemPrice = currentItem.price * quantity;
    const discountRatio = getDiscountRatio(currentItem, quantity);

    itemCount += quantity;
    totalItemsPrice += totalItemPrice;
    paymentPrice += totalItemPrice * (1 - discountRatio);
  }

  return { totalItemsPrice, paymentPrice, itemCount };
}

function findProductById(id) {
  return PROD_LIST.find(product => product.id === id);
}

function getDiscountRatio(product, quantity) {
  if (quantity < 10) return 0;

  switch (product.id) {
    case 'p1':
      return PROD_FIRST_DISCOUNT_RATIO;
    case 'p2':
      return PROD_SECOND_DISCOUNT_RATIO;
    case 'p3':
      return PROD_THIRD_DISCOUNT_RATIO;
    case 'p4':
      return PROD_FOURTH_DISCOUNT_RATIO;
    case 'p5':
      return PROD_FIFTH_DISCOUNT_RATIO;
    default:
      return 0;
  }
}

function calculateDiscountRatio(totalItemsPrice, paymentPrice, itemCount) {
  if (itemCount < 30) return (totalItemsPrice - paymentPrice) / totalItemsPrice;

  const totalBulkDiscountedItemsPrice = paymentPrice * BULK_PURCHASE_DISCOUNT_RATIO;
  const discountPrice = totalItemsPrice - paymentPrice;

  if (totalBulkDiscountedItemsPrice > discountPrice) {
    return BULK_PURCHASE_DISCOUNT_RATIO;
  } else {
    return (totalItemsPrice - paymentPrice) / totalItemsPrice;
  }
}

function applyTuesdayDiscount(paymentPrice, discountRatio) {
  const isTuesday = new Date().getDay() === 2;
  if (isTuesday) {
    paymentPrice *= (1 - TUESDAY_DISCOUNT_RATIO);
    discountRatio = Math.max(discountRatio, TUESDAY_DISCOUNT_RATIO);
  }
  return { paymentPrice, discountRatio };
}

function updateSumView(paymentPrice, discountRatio) {
  const sumView = getElementById(SUM_VIEW_ID);
  sumView.textContent = '총액: ' + Math.round(paymentPrice) + '원';

  if (discountRatio > 0) {
    const spanView = createElement('span');
    spanView.className = 'text-green-500 ml-2';
    spanView.textContent = '(' + (discountRatio * 100).toFixed(1) + '% 할인 적용)';
    appendChildren(sumView, spanView);
  }
}