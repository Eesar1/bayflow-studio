import ApiForm from "@/components/api-form";

export default function SignupForm() {
  return (
    <ApiForm path="/register-owner" submit="Create owner account">
      <label>
        Full name
        <input name="name" required minLength={2} autoComplete="name" />
      </label>
      <label>
        Email
        <input name="email" required type="email" autoComplete="email" />
      </label>
      <label>
        Password
        <input
          name="password"
          required
          type="password"
          minLength={10}
          maxLength={128}
          autoComplete="new-password"
        />
      </label>
    </ApiForm>
  );
}
