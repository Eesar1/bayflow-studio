"use client";

import Header from "@/layout/header";
import type { BookingProps } from "@/types/booking";
import { useBooking } from "./use-booking";
import BookingHeading from "./booking-heading";
import SelectedWorkshop from "./selected-workshop";
import ServiceStep from "./service-step";
import TimeStep from "./time-step";
import VehicleStep from "./vehicle-step";
import ReviewStep from "./review-step";
import BookingSummary from "./booking-summary";

export default function BookingMain(props: BookingProps) {
  const booking = useBooking(props);

  return (
    <>
      <Header user={props.user} />
      <main id="main" className="booking-page">
        <div className="container booking-shell">
          <BookingHeading step={booking.step} />
          {booking.error && (
            <p role="alert" className="form-error">
              {booking.error}
            </p>
          )}
          <div className="booking-columns">
            <div className="booking-main">
              <SelectedWorkshop shop={props.shop} />
              <ServiceStep booking={booking} services={props.services} />
              <TimeStep booking={booking} dates={props.dates} />
              <VehicleStep booking={booking} dates={props.dates} />
              <ReviewStep booking={booking} shop={props.shop} />
            </div>
            <BookingSummary booking={booking} shop={props.shop} />
          </div>
        </div>
      </main>
    </>
  );
}
