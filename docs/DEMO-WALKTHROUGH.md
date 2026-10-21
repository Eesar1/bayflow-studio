# Test the booking handoffs

Open http://localhost:3010/login. Use separate browser profiles or private windows to keep customer and staff sessions separate. Every seeded demo account uses `BayflowDemo2026!`. These are local demo credentials.

| Role | Login | Work to test |
| --- | --- | --- |
| Owner | owner@bayflow.demo | Choose Lahore or Islamabad; manage shops, team and services; review queues |
| Service Advisor | advisor@bayflow.demo | Confirm a booking, assign the technician, review/send estimates, assign parts, notify pickup |
| Technician | technician@bayflow.demo | Start an assigned inspection, save/submit an estimate, finish repairs and return rework to QC |
| Parts Person | parts@bayflow.demo | Work on assigned parts jobs, order/receive missing stock, verify and allocate parts |
| QC Inspector | qc@bayflow.demo | Claim a QC job, record all checks, pass it or return it for rework |
| Customer | customer@bayflow.demo | View BF-1001, approve/reject its estimate when sent, confirm collection |
| Customer for seeded BF-2021 | guest02@bayflow.demo | Approve/reject the estimate already awaiting a customer decision |

Islamabad staff accounts are advisor2, technician2, parts2 and qc2 at `bayflow.demo`. Karachi uses advisor3, technician3, parts3 and qc3; its owner is owner2@bayflow.demo. Staff only see their permitted shops and assignments. A customer sees only their own bookings. Existing demo records may already have progressed through these stages.

1. As a customer, select a workshop and complete services, time, vehicle details and review. New customers register before the wizard. Submission opens My bookings with a reference and receipt; the workshop advisor receives the request.
2. As the advisor, confirm the request and assign Imran Shah. **Assigned** now belongs to technician@bayflow.demo. The owner/advisor sees the handoff, but cannot start the technician's inspection.
3. As the technician, start inspection, enter estimate lines, save the estimate and submit it to the advisor. Part lines must select real inventory; labour lines do not need stock.
4. As the advisor, review and send the estimate. **Awaiting customer** belongs to the specific customer shown on the job, not whichever customer account is currently signed in. That customer opens My bookings to accept or reject it. A rejection goes back through the advisor for a revised inspection/estimate.
5. After approval, the advisor assigns the parts person. That person orders missing parts and receives deliveries in Parts & inventory. Partial deliveries do not unlock repair until all required stock is available. Verify parts ready, then allocate and start repair.
6. The technician completes repair and sends it to QC. The QC inspector claims the job, completes all checks and passes it, or records a rework issue and returns it to repair. Repeat QC after rework.
7. After QC passes, the advisor sends the pickup notice. The advisor or the customer can then confirm collection.

Queues refresh every 15 seconds while visible. Reload when switching accounts if you want to see the latest handoff immediately. Cancellation is a secondary action, not the next workflow step. Empty role queues mean no jobs currently need that role.
