import { useEffect, useState } from "react";
import type { Event } from "@eventhub/contracts";
import { api } from "../../api/client";

/**
 * Стан екрана як дискримінантне об'єднання (розділ 9.5 методички).
 *
 * Неможливі стани на кшталт «помилка й дані одночасно» не виражаються
 * в типі взагалі, а до state.events компілятор не пустить, доки ми
 * не звузили тип перевіркою state.kind === "ready".
 *
 * Зверніть увагу: Event тут – згенерований тип із контракту, а не
 * рукописний інтерфейс. Сам State – це стан UI, а не відповідь API.
 */
type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; events: Event[] };

const priceFormatter = new Intl.NumberFormat("uk-UA", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function EventList() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    // openapi-fetch не кидає винятків на HTTP-помилках.
    // Замість цього повертає { data } АБО { error } – і TypeScript
    // не дасть звернутись до data, поки ви не перевірили error.
    // Це і є "помилки як частина контракту" з лекції.
    api
      .GET("/events", { params: { query: { limit: 20 } } })
      .then(({ data, error }) => {
        if (error) {
          // error має тип Problem – той самий, що описаний у специфікації
          setState({ kind: "error", message: error.title });
          return;
        }
        setState({ kind: "ready", events: data.items });
      })
      .catch(() => {
        // Сюди потрапляють лише мережеві збої (сервер не запущений,
        // CORS тощо) – HTTP-помилки приходять через error вище.
        setState({ kind: "error", message: "Не вдалося з'єднатися з сервером" });
      });
  }, []);

  if (state.kind === "loading") {
    return <p aria-busy="true">Завантаження…</p>;
  }

  if (state.kind === "error") {
    return <p role="alert">{state.message}</p>;
  }

  if (state.events.length === 0) {
    // Порожній каталог – не помилка, а окремий легальний стан.
    return <p>Подій поки немає. Загляньте пізніше.</p>;
  }

  return (
    <ul className="event-list">
      {state.events.map((e) => (
        <li key={e.id}>
          <strong>{e.title}</strong> – {e.venue.city},{" "}
          {new Date(e.startsAt).toLocaleString("uk-UA")}
          {" · від "}
          {/* amount у копійках – ділимо на 100 лише для показу.
              У розрахунках копійки НІКОЛИ не перетворюються
              на дробові гривні. */}
          {priceFormatter.format(e.minPrice.amount / 100)} грн
        </li>
      ))}
    </ul>
  );
}
