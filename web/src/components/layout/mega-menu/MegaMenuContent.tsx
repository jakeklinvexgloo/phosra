"use client"

import type { NavDropdown } from "@/lib/nav-config"
import { MegaMenuSectioned } from "./MegaMenuSectioned"

interface MegaMenuContentProps {
  dropdown: NavDropdown
  variant: "dark" | "light"
  onClose: () => void
}

export function MegaMenuContent({ dropdown, variant, onClose }: MegaMenuContentProps) {
  return <MegaMenuSectioned dropdown={dropdown} variant={variant} onClose={onClose} />
}
