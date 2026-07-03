"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/lib/auth-store";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "../auth.module.css";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [serverError, setServerError] = useState("");

  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError("");
    try {
      await login(data.email, data.password);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(
          err.status === 401 ? "Invalid email or password" : err.message,
        );
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authBg} />
      <div className={styles.authShell}>
        <aside className={styles.authStory}>
          <Link href="/" className={styles.authBrand}>
            <Image
              src="/PairPrep.png"
              alt="PairPrep"
              width={36}
              height={36}
              className={styles.authLogoImage}
              priority
            />
            <span>PairPrep</span>
          </Link>
          <div>
            <h2>Return to your practice workspace.</h2>
            <p>
              Pick up requests, sessions, and feedback without losing the thread
              between mock interviews.
            </p>
          </div>
          <div className={styles.authMetricGrid}>
            <div>
              <strong>3</strong>
              <span>Prep steps</span>
            </div>
            <div>
              <strong>4</strong>
              <span>Interview tracks</span>
            </div>
          </div>
        </aside>

        <div className={styles.authCard}>
          <div className={styles.authLogo}>
            <Image
              src="/PairPrep.png"
              alt="PairPrep"
              width={48}
              height={48}
              className={styles.authLogoImageLarge}
              priority
            />
          </div>
          <h1 className={styles.authTitle}>Welcome back</h1>
          <p className={styles.authSubtitle}>
            Sign in to continue your practice
          </p>

          {serverError && <div className={styles.authError}>{serverError}</div>}

          <form className={styles.authForm} onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...field("email")}
            />
            <Input
              label="Password"
              type="password"
              placeholder="********"
              autoComplete="current-password"
              error={errors.password?.message}
              {...field("password")}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px', marginBottom: '16px' }}>
              <Link href="/forgot-password" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', color: 'var(--accent)' }}>
                Forgot password?
              </Link>
            </div>
            <Button type="submit" fullWidth loading={isSubmitting}>
              Sign In
            </Button>
          </form>

          <p className={styles.authFooter}>
            Don&apos;t have an account? <Link href="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
