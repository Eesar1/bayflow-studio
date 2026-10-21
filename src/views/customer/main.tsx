import Link from "next/link";
import Header from "@/layout/header";
import LiveRefresh from "@/components/live-refresh";
import type { Actor, Job, Notice } from "@/types";
import BookingCard from "./booking-card";
import UpdatesSidebar from "./updates-sidebar";

export default function CustomerMain({
  user,
  bookings,
  notifications,
  created,
}: {
  user: Actor;
  bookings: Job[];
  notifications: Notice[];
  created?: string;
}) {
  const receipt = bookings.find((job) => job.id === created);

  return (
    <>
      <Header user={user} />
      <main id="main" className="customer-page">
        <LiveRefresh />
        <div className="container">
          <div className="customer-heading">
            <div>
              <div className="eyebrow dark">YOUR VEHICLE, YOUR VIEW</div>
              <h1>
                Hello, {user.name.split(" ")[0]}
                <span className="orange">.</span>
              </h1>
              <p>Every repair, every update. All in one place.</p>
            </div>
            <Link className="button button-primary" href="/#workshops">
              Book another service →
            </Link>
          </div>
          <div className="customer-layout">
            <div className="customer-jobs">
              {receipt && (
                <div className="booking-receipt" role="status">
                  <h2>Booking {receipt.reference} received.</h2>
                  <p>
                    Your workshop has your booking. Track confirmation, your estimate and
                    repair updates here.
                  </p>
                </div>
              )}
              {bookings.map((job) => (
                <BookingCard key={job.id} job={job} />
              ))}
              {!bookings.length && (
                <div className="empty">
                  <h2>No bookings yet.</h2>
                  <p>Find a workshop and book your first service.</p>
                  <Link className="button button-primary" href="/#workshops">
                    Find a workshop
                  </Link>
                </div>
              )}
            </div>
            <UpdatesSidebar notifications={notifications} />
          </div>
        </div>
      </main>
    </>
  );
}
