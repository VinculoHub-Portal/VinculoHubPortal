# Demo Fix Plan — Stakeholder Presentation

> Scope: landing page + NPO and company registration flows.
> Total estimated effort: ~20 minutes.

---

## Fix 1 — Company registration: typing email and pressing Enter resets to step 2

**Why it matters:** The stakeholder will fill the email field on step 4 and press Enter. The form submits natively, reloads the page, and drops everything back to step 2.

**File:** `frontend/src/pages/company/registration/index.tsx`

Step 3 form (line 398):
```tsx
// Before
<form className="flex flex-col gap-4">

// After
<form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
```

Step 4 form (line 536):
```tsx
// Before
<form className="flex flex-col gap-4">

// After
<form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
```

---

## Fix 2 — NPO registration: empty placeholder step before "Finalizar"

**Why it matters:** The NPO wizard currently has 4 steps. Step 4 renders only the raw text `"Passo 5 - ONG - Cadastro de Projeto"` with nothing else on screen. The stakeholder will reach this bare screen before being able to finalize.

**Fix:** Remove `NpoStepFive` from the steps array so "Finalizar" falls on the completed address step.

**File:** `frontend/src/pages/RegisterPage/index.tsx`

```tsx
// Before (lines 89–105)
if (organizationType === "npo") {
  return [
    commonFirstStep,
    <NpoStepThree ... />,
    <NpoStepFour ... />,
    <NpoStepFive key="npo-step-5" />,   // ← remove this line
  ];
}

// After
if (organizationType === "npo") {
  return [
    commonFirstStep,
    <NpoStepThree ... />,
    <NpoStepFour ... />,
  ];
}
```

Also remove the unused local component above (lines 43–45):
```tsx
// Delete this:
function NpoStepFive() {
  return <div>Passo 5 - ONG - Cadastro de Projeto</div>;
}
```

---

## Fix 3 — NPO registration: "Já tenho login" link goes nowhere

**Why it matters:** The link on step 1 has a nested `<a>` inside a `<Link>` (invalid HTML) and points to `/Login`, a route that doesn't exist. Clicking it opens a blank white page.

**Fix:** Replace the broken pattern with a button that triggers Auth0 login directly.

**File:** `frontend/src/components/wizard/WizardSignUp.tsx`

Add `useAuth0` import at the top:
```tsx
import { useAuth0 } from "@auth0/auth0-react";
```

Update the component signature to destructure `loginWithRedirect` from the hook and replace the broken link:
```tsx
// Before (lines 88–94)
<div className="flex items-center w-full justify-center py-8 mx-auto max-w-xl">
  <Link to="/Login">
    <a className="text-vinculo-dark text-x -webkit-font-smoothing hover:underline">
      Já tenho login
    </a>
  </Link>
</div>

// After
<div className="flex items-center w-full justify-center py-8 mx-auto max-w-xl">
  <button
    type="button"
    onClick={() => loginWithRedirect()}
    className="text-vinculo-dark text-sm hover:underline"
  >
    Já tenho login
  </button>
</div>
```

Remove the now-unused `Link` import if nothing else uses it in that file.

---

## Fix 4 — Company registration: missing accent in error message

**Why it matters:** The validation error reads "CNPJ invalido" — a visible spelling mistake on the main company registration field.

**File:** `frontend/src/pages/company/registration/index.tsx`, line 219

```tsx
// Before
setCnpjError("CNPJ invalido");

// After
setCnpjError("CNPJ inválido");
```

---

## Rebuild after changes

```bash
docker compose up -d --build frontend
```

---

## What this does NOT fix (acceptable for demo)

- CEP/address fields are disabled if the API lookup fails — ensure the demo uses a valid CEP.
- Company step 3 has no validation before advancing — coach the stakeholder to fill address fields.
- Wizard state resets on page reload — avoid refreshing mid-flow during the demo.
