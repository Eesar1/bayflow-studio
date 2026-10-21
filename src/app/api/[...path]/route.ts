import { applicationURL, auth } from "@/lib/auth";
import { sql } from "@/db";
import { ZodError } from "zod";
import { AppError, requireThat } from "@/lib/workflow";
import { availableSlots } from "@/lib/slots";
import { dashboardData, customerData } from "@/lib/data";
import * as M from "@/lib/mutations";

async function handle(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params;
    const [area, id, action, subid, subaction] = path;
    if (req.method === "GET" && area === "health") {
      await sql`select 1`;

      return Response.json({ ok: true, service: "bayflow", database: "postgresql" });
    }
    if (req.method === "GET" && area === "shops" && action === "slots")
      return Response.json(
        await availableSlots(id, new URL(req.url).searchParams.get("date") ?? ""),
      );
    const session = await auth.api.getSession({ headers: req.headers });
    const user = session?.user ?? null;
    if (req.method === "POST") {
      requireThat(
        applicationURL &&
          req.headers.get("origin") === new URL(applicationURL).origin,
        "Request origin rejected.",
        403,
      );
      requireThat(
        req.headers.get("content-type")?.split(";")[0] === "application/json",
        "Send JSON.",
        415,
      );
      const body = await req.json().catch(() => {
        throw new AppError("Invalid JSON.", 400);
      });
      if (area === "register-owner") return await M.registerOwner(body);
      if (area === "bookings" && !id) return await M.createBooking(body, user);
      requireThat(user, "Sign in first.", 401);
      let result;
      if (area === "bookings" && id)
        result = await M.bookingMutation(id, action, body, user);
      else if (area === "purchase-orders" && action === "receive")
        result = await M.receiveOrder(id, body, user);
      else if (area === "shops" && !id) result = await M.createShop(body, user);
      else if (area === "shops" && id)
        result = await M.shopMutation(
          id,
          subaction === "update" ? "service-update" : (subaction ?? action),
          body,
          user,
          subid,
        );
      else if (area === "notifications" && id === "read") {
        await sql`update notifications set read_at=now() where user_id=${user.id} and read_at is null`;
        result = { ok: true };
      } else throw new AppError("Endpoint not found.", 404);

      return Response.json(result);
    }
    requireThat(user, "Sign in first.", 401);
    if (area === "dashboard")
      return Response.json(
        await dashboardData(user, new URL(req.url).searchParams.get("shop") ?? undefined),
      );
    if (area === "customer") {
      requireThat(user.kind === "CUSTOMER", "Customer account required.", 403);

      return Response.json(await customerData(user));
    }
    throw new AppError("Endpoint not found.", 404);
  } catch (error) {
    if (error instanceof ZodError)
      return Response.json(
        {
          ok: false,
          error: error.issues.map((i) => i.path.join(".") + ": " + i.message).join("; "),
        },
        { status: 422 },
      );
    if (error instanceof AppError)
      return Response.json({ ok: false, error: error.message }, { status: error.status });
    if ((error as { code?: string }).code === "23505")
      return Response.json(
        { ok: false, error: "That record already exists." },
        { status: 409 },
      );
    console.error(
      "BayFlow request failed:",
      error instanceof Error ? error.name : "UnknownError",
    );

    return Response.json(
      { ok: false, error: "The request could not be completed." },
      { status: 500 },
    );
  }
}
export const GET = handle;
export const POST = handle;
