"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { UserPlus } from "lucide-react"
import { api } from "@/lib/api"
import type { Family, Child } from "@/lib/types"

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
}

const cardItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
}

export default function ChildrenPage() {
  const [families, setFamilies] = useState<Family[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [selectedFamily, setSelectedFamily] = useState<string>("")
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [newBirthDate, setNewBirthDate] = useState("")

  useEffect(() => {
    api.listFamilies().then((data) => {
      setFamilies(data || [])
      if (data && data.length > 0) {
        setSelectedFamily(data[0].id)
        api.listChildren(data[0].id).then(c => setChildren(c || []))
      }
    })
  }, [])

  const loadChildren = async (familyId: string) => {
    setSelectedFamily(familyId)
    const c = await api.listChildren(familyId)
    setChildren(c || [])
  }

  const createChild = async () => {
    if (!newName || !newBirthDate || !selectedFamily) return
    const child = await api.createChild(selectedFamily, newName, newBirthDate)
    setChildren([...children, child])
    setNewName("")
    setNewBirthDate("")
    setShowCreate(false)
  }

  const getAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const now = new Date()
    let age = now.getFullYear() - birth.getFullYear()
    if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--
    return age
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-foreground">Children</h2>
        <div className="flex gap-3">
          {families.length > 1 && (
            <select value={selectedFamily} onChange={(e) => loadChildren(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">
              {families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          )}
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition shadow-lg shadow-indigo-500/25">
            <UserPlus className="w-4 h-4" />
            Add Child
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="bg-card rounded-xl shadow-sm border border-border/50 p-6 mb-6 overflow-hidden"
          >
            <h3 className="text-lg font-medium text-foreground mb-4">Add Child</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Birth Date</label>
                <input type="date" value={newBirthDate} onChange={(e) => setNewBirthDate(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={createChild} className="gradient-primary text-white px-4 py-2 rounded-lg text-sm">Add Child</button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg text-sm border border-border text-foreground hover:bg-muted/50">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {children.map((child) => (
          <motion.div key={child.id} variants={cardItem}>
            <Link href={`/dashboard/children/${child.id}`} className="block bg-card rounded-xl shadow-sm border border-border/50 p-6 card-hover">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-bold ring-2 ring-transparent hover:ring-primary/20 transition-all">
                  {child.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-foreground">{child.name}</p>
                  <p className="text-sm text-muted-foreground">Age {getAge(child.birth_date)}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
