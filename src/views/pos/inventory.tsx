"use client";

import ApiForm from "@/components/api-form";
import { money } from "@/constant/workflow";
import ReceiveForm from "./receive-form";
import type { Dashboard } from "@/types";

export default function InventoryView({ data }: { data: Dashboard }) {
  const shop = data.shop!;

  return (
    <>
      <div className="table-scroll">
        <table className="jobs-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Part</th>
              <th>Stock</th>
              <th>Reorder at</th>
              <th>Unit cost</th>
            </tr>
          </thead>
          <tbody>
            {data.inventory.map((p) => (
              <tr key={p.id}>
                <td className="mono">{p.sku}</td>
                <td>{p.name}</td>
                <td className={p.quantity <= p.reorder_level ? "orange" : ""}>
                  {p.quantity}
                </td>
                <td>{p.reorder_level}</td>
                <td>{money(p.unit_cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {["OWNER", "PARTS"].includes(data.role) && (
        <details className="management-form">
          <summary>Add inventory part</summary>
          <ApiForm path={`/shops/${shop.id}/inventory`} submit="Add part">
            <label>
              SKU
              <input name="sku" required />
            </label>
            <label>
              Part name
              <input name="name" required />
            </label>
            <label>
              Quantity
              <input name="quantity" type="number" min="0" defaultValue="0" />
            </label>
            <label>
              Reorder level
              <input name="reorder_level" type="number" min="0" defaultValue="2" />
            </label>
            <label>
              Unit cost (PKR)
              <input name="unit_cost" type="number" min="0" defaultValue="0" />
            </label>
          </ApiForm>
        </details>
      )}
      <h2 className="subheading">Purchase orders</h2>
      {data.orders.map((po) => (
        <article className="purchase-order" key={po.id}>
          <h3>
            {po.reference} · {po.supplier}
          </h3>
          <p>{po.status.replaceAll("_", " ")}</p>
          {po.items.map((i) => (
            <p key={i.id}>
              {i.name}: {i.received} / {i.quantity} received
            </p>
          ))}
          {po.status !== "RECEIVED" && ["OWNER", "PARTS"].includes(data.role) && (
            <ReceiveForm order={po} />
          )}
        </article>
      ))}
      {!data.orders.length && <p className="empty">No purchase orders yet.</p>}
    </>
  );
}
