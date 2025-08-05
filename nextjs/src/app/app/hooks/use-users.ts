"use client"

import { createSPASassClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { Profile } from "@/lib/types"

export function useUsers() {
    const [users, setUsers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
  
    useEffect(() => {
      async function fetchUsers() {
        try {
          setLoading(true)
          setError(null)
        
          const supabase = await createSPASassClient();
          
          const { data, error } = await supabase.getAllUsers()
          if (error) {
            throw new Error(error.message)
          }
          setUsers(data || [])
        } catch (err) {
          console.error("Error fetching users:", err)
          setError(err instanceof Error ? err.message : "Failed to fetch users")
        } finally {
          setLoading(false)
        }
      }
  
      fetchUsers()
    }, [])
  
    return { users, loading, error }
  }