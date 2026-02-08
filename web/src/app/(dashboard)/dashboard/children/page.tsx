"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { UserPlus } from "lucide-react"
import { api } from "@/lib/api"
import type { Family, Child } from "@/lib/types"

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
        <h2 className="text-h2 text-foreground">Children</h2>
        <div className="flex gap-3">
          {families.length > 1 && (
            <select value={selectedFamily} onChange={(e) => loadChildren(e.target.value)} className="rounded border border-input bg-white px-3 py-2 text-sm text-foreground">
              {families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          )}
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-foreground text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition">
            <UserPlus className="w-4 h-4" />
            Add Child
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="plaid-card mb-6">
          <h3 className="text-base font-medium text-foreground mb-4">Add Child</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Name</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="plaid-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Birth Date</label>
              <input type="date" value={newBirthDate} onChange={(e) => setNewBirthDate(e.target.value)} className="plaid-input" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={createChild} className="bg-foreground text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition">Add Child</button>
            <button onClick={() => setShowCreate(false)} className="px-5 py-2.5 rounded-full text-sm border border-foreground text-foreground hover:bg-muted transition">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children.map((child) => (
          <Link key={child.id} href={`/dashboard/children/${child.id}`} className="plaid-card block">
            <p className="font-medium text-foreground">{child.name}</p>
            <p className="text-sm text-muted-foreground mt-1">Age {getAge(child.birth_date)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
