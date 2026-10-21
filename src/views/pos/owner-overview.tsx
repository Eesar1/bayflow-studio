import { STAGES, label } from "@/constant/workflow";
import type { Dashboard } from "@/types";

export default function OwnerOverview({ data }: { data: Dashboard }) {
  const statusCounts = STAGES.map((status) => ({
    status,
    count: data.bookings.filter((booking) => booking.status === status).length,
  }));
  const lowStock = data.inventory.filter((part) => part.quantity <= part.reorder_level);
  const activeMembers = data.members.filter((member) => member.active);
  const totalUnits = data.inventory.reduce((total, part) => total + part.quantity, 0);

  return (
    <section className="owner-overview" aria-label="Shop management summary">
      <article className="owner-summary-card">
        <div className="owner-summary-heading">
          <div>
            <span className="panel-overline">BOOKINGS</span>
            <h2>By status</h2>
          </div>
          <strong>{data.bookings.length}</strong>
        </div>
        <ul className="owner-status-list">
          {statusCounts.map(({ status, count }) => (
            <li key={status}>
              <span>{label(status)}</span>
              <strong>{count}</strong>
            </li>
          ))}
        </ul>
      </article>

      <article className="owner-summary-card">
        <div className="owner-summary-heading">
          <div>
            <span className="panel-overline">TEAM</span>
            <h2>Workshop members</h2>
          </div>
          <strong>{activeMembers.length}</strong>
        </div>
        {activeMembers.length ? (
          <ul className="owner-member-list">
            {activeMembers.map((member) => (
              <li key={member.user_id}>
                <span>{member.name}</span>
                <small>{label(member.role)}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p className="owner-summary-empty">No active team members yet.</p>
        )}
      </article>

      <article className="owner-summary-card">
        <div className="owner-summary-heading">
          <div>
            <span className="panel-overline">PARTS</span>
            <h2>Inventory summary</h2>
          </div>
          <strong>{data.inventory.length}</strong>
        </div>
        <dl className="owner-inventory-stats">
          <div>
            <dt>Units on hand</dt>
            <dd>{totalUnits}</dd>
          </div>
          <div>
            <dt>At or below reorder level</dt>
            <dd>{lowStock.length}</dd>
          </div>
        </dl>
        {lowStock.length ? (
          <ul className="owner-low-stock-list">
            {lowStock.slice(0, 4).map((part) => (
              <li key={part.id}>
                <span>{part.name}</span>
                <small>{part.quantity} left</small>
              </li>
            ))}
          </ul>
        ) : (
          <p className="owner-summary-empty">No parts need reordering.</p>
        )}
      </article>
    </section>
  );
}
