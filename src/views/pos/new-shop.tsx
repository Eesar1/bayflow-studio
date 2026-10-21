import ApiForm from "@/components/api-form";

export default function NewShop() {
  return (
    <details className="management-form">
      <summary>Create a workshop</summary>
      <ApiForm path="/shops" submit="Create workshop">
        <label>
          Name
          <input name="name" required />
        </label>
        <label>
          City
          <input name="city" required />
        </label>
        <label>
          Address
          <input name="address" required />
        </label>
        <label>
          Phone
          <input name="phone" required />
        </label>
        <label>
          Description
          <textarea name="description" />
        </label>
        <label>
          Opens
          <input name="hours_start" type="time" defaultValue="09:00" required />
        </label>
        <label>
          Closes
          <input name="hours_end" type="time" defaultValue="18:00" required />
        </label>
        <label>
          Slot duration
          <select name="slot_minutes">
            {[30, 45, 60, 90, 120].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        <label>
          Capacity
          <input
            name="capacity"
            type="number"
            min="1"
            max="20"
            defaultValue="2"
            required
          />
        </label>
      </ApiForm>
    </details>
  );
}
