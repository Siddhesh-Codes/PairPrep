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

const registerSchema = z
  .object({
    displayName: z.string().min(2, "At least 2 characters").max(100),
    email: z.string().email("Invalid email"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Needs an uppercase letter")
      .regex(/[a-z]/, "Needs a lowercase letter")
      .regex(/[0-9]/, "Needs a digit")
      .regex(/[^A-Za-z0-9]/, "Needs a special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [serverError, setServerError] = useState("");

  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setServerError("");
    try {
      await register(data.email, data.password, data.displayName);
      router.push("/onboarding");
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
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
            <h2>Set up a stronger interview practice loop.</h2>
            <p>
              Create a focused profile, choose your practice tracks, and find
              partners who are preparing seriously.
            </p>
          </div>
          <div className={styles.authMetricGrid}>
            <div>
              <strong>92%</strong>
              <span>Match signal</span>
            </div>
            <div>
              <strong>4</strong>
              <span>Feedback areas</span>
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
          <h1 className={styles.authTitle}>Create your account</h1>
          <p className={styles.authSubtitle}>
            Start practicing mock interviews with peers
          </p>

          {serverError && <div className={styles.authError}>{serverError}</div>}

          <form className={styles.authForm} onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Display Name"
              placeholder="Jane Doe"
              autoComplete="name"
              error={errors.displayName?.message}
              {...field("displayName")}
            />
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
              autoComplete="new-password"
              error={errors.password?.message}
              {...field("password")}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="********"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...field("confirmPassword")}
            />
            <Button type="submit" fullWidth loading={isSubmitting}>
              Create Account
            </Button>
          </form>

          <p className={styles.authFooter}>
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
