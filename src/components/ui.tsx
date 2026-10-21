import { label, money, dateTime } from "@/constant/workflow";
import type { Job } from "@/types";

export function Status({ value }: { value: string }) {
  return (
    <span className={"status-chip status-" + value.toLowerCase()}>{label(value)}</span>
  );
}
export function EstimateTable({ job }: { job: Job }) {
  const e = job.estimate;
  if (!e) return <p className="hint">No estimate has been submitted yet.</p>;

  return (
    <div className="estimate-display">
      <div className="estimate-title">
        <h3>Estimate · revision {e.revision}</h3>
        <Status value={e.status} />
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {e.items.map((i, n) => (
              <tr key={i.id ?? n}>
                <td>
                  {i.description}
                  <small>{i.kind}</small>
                </td>
                <td>{i.quantity}</td>
                <td>{money(i.unit_price)}</td>
                <td>{money(i.quantity * i.unit_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="estimate-footer">
        TOTAL <strong>{money(e.total)}</strong>
      </div>
      {e.notes && <p>{e.notes}</p>}
    </div>
  );
}
export function Timeline({ job }: { job: Job }) {
  return (
    <details className="repair-history">
      <summary>Repair history · {job.history.length} events</summary>
      <ol className="history-list">
        {job.history.map((h) => (
          <li key={h.id}>
            <span>{dateTime(h.created_at)}</span>
            <b>
              {label(h.from_status)} · {label(h.to_status)}
            </b>
            <small>
              {h.actor}
              {h.note ? " · " + h.note : ""}
            </small>
          </li>
        ))}
      </ol>
      {!job.history.length && <p>Waiting for the advisor to confirm.</p>}
    </details>
  );
}
