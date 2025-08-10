'use client'

import { useState, useEffect } from 'react'
import { Plus, Store, Search, MoreHorizontal, Edit, Trash2, Eye, MapPin, Phone, Mail, User, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Store as StoreType } from '@/lib/types'
import { StoreDialog } from './components/store-dialog'
import { useStores } from '../inventory/hooks/use-stores'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function StoresPage() {
  const [search, setSearch] = useState('')
  const [storeDialogOpen, setStoreDialogOpen] = useState(false)
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [storeToDelete, setStoreToDelete] = useState<StoreType | null>(null)

  const { stores, loading, error, fetchStores, deleteStore } = useStores()

  useEffect(() => {
    fetchStores({
      search: search || undefined,
    })
  }, [search, fetchStores])

  const handleEditStore = (store: StoreType) => {
    setSelectedStore(store)
    setStoreDialogOpen(true)
  }

  const handleDeleteStore = (store: StoreType) => {
    setStoreToDelete(store)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!storeToDelete) return
    
    try {
      await deleteStore(storeToDelete.id)
      fetchStores({ search: search || undefined })
      setDeleteDialogOpen(false)
      setStoreToDelete(null)
    } catch (error) {
      console.error('Failed to delete store:', error)
    }
  }

  const activeStores = stores.filter(store => store.is_active).length
  const inactiveStores = stores.filter(store => !store.is_active).length

  return (
    <div className="w-full space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store Management</h1>
          <p className="text-muted-foreground">Manage your store locations and details</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => {
          setSelectedStore(null)
          setStoreDialogOpen(true)
        }}>
          <Plus className="w-4 h-4" />
          Add Store
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stores.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Stores</CardTitle>
            <Store className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeStores}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Stores</CardTitle>
            <Store className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{inactiveStores}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Stores</CardTitle>
              <CardDescription>A list of all your store locations</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search stores..." 
                  className="pl-8 w-[300px]" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading stores...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-600">
              Error loading stores: {error}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                            <Store className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium">{store.name}</div>
                            <div className="text-sm text-muted-foreground">{store.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{store.location || 'No location set'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {store.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              <span>{store.phone}</span>
                            </div>
                          )}
                          {store.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              <span>{store.email}</span>
                            </div>
                          )}
                          {!store.phone && !store.email && (
                            <span className="text-sm text-muted-foreground">No contact info</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {store.profiles ? (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>{store.profiles.name || store.profiles.email}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No manager assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={store.is_active ? "default" : "secondary"}
                          className={store.is_active ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                        >
                          {store.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(store.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="flex items-center gap-2"
                              onClick={() => handleEditStore(store)}
                            >
                              <Edit className="w-4 h-4" />
                              Edit Store
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="flex items-center gap-2 text-red-600"
                              onClick={() => handleDeleteStore(store)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Store
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {stores.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No stores found. Add your first store to get started.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <StoreDialog
        open={storeDialogOpen}
        onOpenChange={setStoreDialogOpen}
        store={selectedStore}
        onSuccess={() => {
          fetchStores({ search: search || undefined })
          setSelectedStore(null)
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the store &ldquo;{storeToDelete?.name}&rdquo;. This action cannot be undone.
              {storeToDelete && (
                <div className="mt-2 text-sm text-yellow-600">
                  Note: You cannot delete stores that have existing stock. Consider deactivating the store instead.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Store
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}