"use server"

import { signOut as workosSignOut, getSignInUrl, getSignUpUrl } from "@workos-inc/authkit-nextjs"
import { redirect } from "next/navigation"

export async function signOut() {
  return workosSignOut()
}

export async function signIn() {
  const url = await getSignInUrl()
  redirect(url)
}

export async function signUp() {
  const url = await getSignUpUrl()
  redirect(url)
}
