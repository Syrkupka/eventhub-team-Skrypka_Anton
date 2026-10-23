import createClient from "openapi-fetch";
import type { paths } from "@eventhub/contracts";

/**
 * Типізований клієнт API.
 *
 * createClient<paths> – тут і відбувається вся магія: з типу paths,
 * згенерованого зі специфікації, openapi-fetch виводить
 * дозволені шляхи, параметри запиту й типи відповідей.
 *
 * Наслідок: неіснуючий шлях або зайвий параметр – це помилка
 * компіляції, а не 404 у рантаймі.
 */
export const api = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL,
  // Для перевірки порожнього стану (розділ 9.5) тимчасово розкоментуйте:
  // headers: { Prefer: "example=empty" },
  // і ОБОВ'ЯЗКОВО закоментуйте назад перед здачею.
});
