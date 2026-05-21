"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const authRoutes = {
  dashboard: "/dashboard",
  login: "/auth/login",
  register: "/auth/register",
} as const;

function getField(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

function normalizeRedirectTo(value: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return authRoutes.dashboard;
  }

  return value;
}

function redirectWithMessage(
  path: string,
  type: "error" | "message",
  message: string,
  params?: Record<string, string>,
): never {
  const searchParams = new URLSearchParams({ [type]: message, ...params });

  redirect(`${path}?${searchParams.toString()}`);
}

export async function signIn(formData: FormData) {
  const email = getField(formData, "email");
  const password = getField(formData, "password");
  const redirectTo = normalizeRedirectTo(getField(formData, "redirectTo"));

  if (!email || !password) {
    redirectWithMessage(authRoutes.login, "error", "Введите email и пароль.", {
      redirectTo,
    });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirectWithMessage(authRoutes.login, "error", error.message, {
      redirectTo,
    });
  }

  redirect(redirectTo);
}

export async function signUp(formData: FormData) {
  const email = getField(formData, "email");
  const password = getField(formData, "password");
  const fullName = getField(formData, "fullName");

  if (!email || !password) {
    redirectWithMessage(
      authRoutes.register,
      "error",
      "Введите email и пароль.",
    );
  }

  if (password.length < 6) {
    redirectWithMessage(
      authRoutes.register,
      "error",
      "Пароль должен быть не короче 6 символов.",
    );
  }

  const headersList = await headers();
  const origin = headersList.get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || null,
      },
      emailRedirectTo: `${origin}${authRoutes.dashboard}`,
    },
  });

  if (error) {
    redirectWithMessage(authRoutes.register, "error", error.message);
  }

  if (data.session) {
    redirect(authRoutes.dashboard);
  }

  redirectWithMessage(
    authRoutes.login,
    "message",
    "Аккаунт создан. Проверьте email и подтвердите регистрацию.",
  );
}

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect(authRoutes.login);
}
