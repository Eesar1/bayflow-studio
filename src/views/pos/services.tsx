"use client";

import ApiForm from "@/components/api-form";
import { money } from "@/constant/workflow";
import type { Dashboard } from "@/types";

export default function ServicesView({ data }: { data: Dashboard }) {
  const shop = data.shop!;

  return (
    <>
      {data.services.map((s) => (
        <details className="management-form" key={s.id}>
          <summary>
            {s.name} · {money(s.base_price)}
          </summary>
          <ApiForm
            path={`/shops/${shop.id}/services/${s.id}/update`}
            submit="Update service"
          >
            <label>
              Name
              <input name="name" defaultValue={s.name} required />
            </label>
            <label>
              Description
              <textarea name="description" defaultValue={s.description} />
            </label>
            <label>
              Minutes
              <input
                name="minutes"
                type="number"
                min="15"
                max="480"
                defaultValue={s.minutes}
              />
            </label>
            <label>
              Starting price (PKR)
              <input
                name="base_price"
                type="number"
                min="0"
                defaultValue={s.base_price}
              />
            </label>
          </ApiForm>
        </details>
      ))}
      <details className="management-form">
        <summary>Add a service</summary>
        <ApiForm path={`/shops/${shop.id}/services`} submit="Add service">
          <label>
            Name
            <input name="name" required />
          </label>
          <label>
            Description
            <textarea name="description" />
          </label>
          <label>
            Duration (minutes)
            <input name="minutes" type="number" min="15" max="480" defaultValue="60" />
          </label>
          <label>
            Starting price (PKR)
            <input name="base_price" type="number" min="0" defaultValue="0" />
          </label>
        </ApiForm>
      </details>
    </>
  );
}
