import React from 'react'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Switch, Alert, Modal } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc } from './lib/trpc'
import { trpcClient } from './lib/trpc-client'

export default function App() {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }))

  const [trpcClientState] = React.useState(() => trpcClient)

  return (
    <trpc.Provider client={trpcClientState} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <View style={styles.container}>
          <StatusBar style="auto" />
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.appTitle}>Plannting</Text>

            <ToDoDisplay />

            <ChoresDisplay />

            <PlantsDisplay />

            <FertilizersDisplay />

            <HealthDisplay />
          </ScrollView>
        </View>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

function HealthDisplay() {
  const {
    data: health,
    isLoading,
    error,
    isError,
    refetch,
    isRefetching
  } = trpc.health.useQuery(undefined, {
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 1,
  });

  if (isLoading) {
    return (
      <View style={styles.statusContainer}>
        <Text style={styles.loadingText}>Loading status...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.statusContainer, styles.errorContainer]}>
        <Text style={styles.errorText}>
          Error: {error?.message || 'Unknown error'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.infoContainer]}>
      <View style={styles.header}>
        <Text style={styles.title}>API Health</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => refetch()}
          disabled={isRefetching}
        >
          <Text style={styles.buttonText}>
            {isRefetching ? 'Refreshing...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.statusInfo}>
        <Text style={styles.statusText}>
          <Text style={styles.label}>API Status:</Text> {health?.status}
        </Text>
        <Text style={styles.statusText}>
          <Text style={styles.label}>MongoDB Status:</Text> {health?.db.mongo.status}
        </Text>
        <Text style={styles.statusText}>
          <Text style={styles.label}>Timestamp:</Text> {health?.timestamp}
        </Text>
      </View>
    </View>
  );
}

function FertilizersDisplay() {
  const [showForm, setShowForm] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set())
  const [formData, setFormData] = React.useState({
    name: '',
    type: 'liquid' as 'liquid' | 'granules',
    isOrganic: false,
    notes: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
  })
  const [editFormData, setEditFormData] = React.useState({
    name: '',
    type: 'liquid' as 'liquid' | 'granules',
    isOrganic: false,
    notes: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
  })

  const {
    data,
    isLoading,
    error,
    isError,
    refetch,
    isRefetching
  } = trpc.fertilizers.list.useQuery({ q: ''}, {
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 1,
  });

  const createMutation = trpc.fertilizers.create.useMutation({
    onSuccess: () => {
      refetch()
      setShowForm(false)
      setFormData({
        name: '',
        type: 'liquid',
        isOrganic: false,
        notes: '',
        nitrogen: '',
        phosphorus: '',
        potassium: '',
      })
    },
  })

  const updateMutation = trpc.fertilizers.update.useMutation({
    onSuccess: () => {
      refetch()
      setEditingId(null)
      setEditFormData({
        name: '',
        type: 'liquid',
        isOrganic: false,
        notes: '',
        nitrogen: '',
        phosphorus: '',
        potassium: '',
      })
    },
  })

  const deleteMutation = trpc.fertilizers.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.nitrogen || !formData.phosphorus || !formData.potassium) {
      return
    }

    createMutation.mutate({
      name: formData.name,
      type: formData.type,
      isOrganic: formData.isOrganic,
      notes: formData.notes || undefined,
      nitrogen: parseFloat(formData.nitrogen),
      phosphorus: parseFloat(formData.phosphorus),
      potassium: parseFloat(formData.potassium),
    })
  }

  const handleEditSubmit = () => {
    if (!editingId || !editFormData.name || !editFormData.nitrogen || !editFormData.phosphorus || !editFormData.potassium) {
      return
    }

    updateMutation.mutate({
      id: editingId,
      name: editFormData.name,
      type: editFormData.type,
      isOrganic: editFormData.isOrganic,
      notes: editFormData.notes || undefined,
      nitrogen: parseFloat(editFormData.nitrogen),
      phosphorus: parseFloat(editFormData.phosphorus),
      potassium: parseFloat(editFormData.potassium),
    })
  }

  const handleEditClick = (fertilizer: NonNullable<typeof data>['fertilizers'][0]) => {
    setEditingId(fertilizer._id)
    setEditFormData({
      name: fertilizer.name,
      type: fertilizer.type,
      isOrganic: fertilizer.isOrganic,
      notes: fertilizer.notes || '',
      nitrogen: fertilizer.nitrogen?.toString() || '',
      phosphorus: fertilizer.phosphorus?.toString() || '',
      potassium: fertilizer.potassium?.toString() || '',
    })
  }

  const handleDeleteClick = (fertilizer: NonNullable<typeof data>['fertilizers'][0]) => {
    Alert.alert(
      'Delete Fertilizer',
      `Are you sure you want to delete ${fertilizer.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate({ id: fertilizer._id })
          },
        },
      ]
    )
  }

  const toggleExpand = (fertilizerId: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fertilizerId)) {
        newSet.delete(fertilizerId)
      } else {
        newSet.add(fertilizerId)
      }
      return newSet
    })
  }

  if (isLoading) {
    return (
      <View style={styles.statusContainer}>
        <Text style={styles.loadingText}>Loading fertilizers...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.statusContainer, styles.errorContainer]}>
        <Text style={styles.errorText}>
          Error: {error?.message || 'Unknown error'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.statusContainer, styles.successContainer]}>
      <View style={styles.header}>
        <Text style={styles.title}>Fertilizers</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowForm(!showForm)}
          >
            <Text style={styles.buttonText}>
              {showForm ? 'Cancel' : '+ Add'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => refetch()}
            disabled={isRefetching}
          >
            <Text style={styles.buttonText}>
              {isRefetching ? 'Refreshing...' : 'Refresh'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Add New Fertilizer</Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />

          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                formData.type === 'liquid' && styles.typeButtonActive
              ]}
              onPress={() => setFormData({ ...formData, type: 'liquid' })}
            >
              <Text style={[
                styles.typeButtonText,
                formData.type === 'liquid' && styles.typeButtonTextActive
              ]}>
                Liquid
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                styles.typeButtonRight,
                formData.type === 'granules' && styles.typeButtonActive
              ]}
              onPress={() => setFormData({ ...formData, type: 'granules' })}
            >
              <Text style={[
                styles.typeButtonText,
                formData.type === 'granules' && styles.typeButtonTextActive
              ]}>
                Granules
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Organic</Text>
            <Switch
              value={formData.isOrganic}
              onValueChange={(value) => setFormData({ ...formData, isOrganic: value })}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Nitrogen (N)"
            value={formData.nitrogen}
            onChangeText={(text) => setFormData({ ...formData, nitrogen: text })}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Phosphorus (P)"
            value={formData.phosphorus}
            onChangeText={(text) => setFormData({ ...formData, phosphorus: text })}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Potassium (K)"
            value={formData.potassium}
            onChangeText={(text) => setFormData({ ...formData, potassium: text })}
            keyboardType="numeric"
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Notes (optional)"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            multiline
            numberOfLines={3}
          />

          {createMutation.error && (
            <Text style={styles.errorText}>
              Error: {createMutation.error.message}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.submitButton, createMutation.isPending && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={createMutation.isPending}
          >
            <Text style={styles.buttonText}>
              {createMutation.isPending ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cancelButton, createMutation.isPending && styles.submitButtonDisabled]}
            onPress={() => setShowForm(false)}
            disabled={createMutation.isPending}
          >
            <Text style={styles.buttonText}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {!data?.fertilizers?.length ? (
        <Text style={styles.listItemText}>No fertilizers found.</Text>
      ) : data?.fertilizers?.map((fertilizer, index) => {
        const isExpanded = expandedIds.has(fertilizer._id)
        const isEditing = editingId === fertilizer._id

        return (
          <View key={fertilizer._id} style={styles.listItem}>
            {isEditing ? (
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>Edit Fertilizer</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  value={editFormData.name}
                  onChangeText={(text) => setEditFormData({ ...editFormData, name: text })}
                />

                <View style={styles.typeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      editFormData.type === 'liquid' && styles.typeButtonActive
                    ]}
                    onPress={() => setEditFormData({ ...editFormData, type: 'liquid' })}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      editFormData.type === 'liquid' && styles.typeButtonTextActive
                    ]}>
                      Liquid
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      styles.typeButtonRight,
                      editFormData.type === 'granules' && styles.typeButtonActive
                    ]}
                    onPress={() => setEditFormData({ ...editFormData, type: 'granules' })}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      editFormData.type === 'granules' && styles.typeButtonTextActive
                    ]}>
                      Granules
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Organic</Text>
                  <Switch
                    value={editFormData.isOrganic}
                    onValueChange={(value) => setEditFormData({ ...editFormData, isOrganic: value })}
                  />
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Nitrogen (N)"
                  value={editFormData.nitrogen}
                  onChangeText={(text) => setEditFormData({ ...editFormData, nitrogen: text })}
                  keyboardType="numeric"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Phosphorus (P)"
                  value={editFormData.phosphorus}
                  onChangeText={(text) => setEditFormData({ ...editFormData, phosphorus: text })}
                  keyboardType="numeric"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Potassium (K)"
                  value={editFormData.potassium}
                  onChangeText={(text) => setEditFormData({ ...editFormData, potassium: text })}
                  keyboardType="numeric"
                />

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Notes (optional)"
                  value={editFormData.notes}
                  onChangeText={(text) => setEditFormData({ ...editFormData, notes: text })}
                  multiline
                  numberOfLines={3}
                />

                {updateMutation.error && (
                  <Text style={styles.errorText}>
                    Error: {updateMutation.error.message}
                  </Text>
                )}

                <TouchableOpacity
                  style={[styles.submitButton, updateMutation.isPending && styles.submitButtonDisabled]}
                  onPress={handleEditSubmit}
                  disabled={updateMutation.isPending}
                >
                  <Text style={styles.buttonText}>
                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cancelButton, updateMutation.isPending && styles.submitButtonDisabled]}
                  onPress={() => {
                    setEditingId(null)
                    setEditFormData({
                      name: '',
                      type: 'liquid',
                      isOrganic: false,
                      notes: '',
                      nitrogen: '',
                      phosphorus: '',
                      potassium: '',
                    })
                  }}
                  disabled={updateMutation.isPending}
                >
                  <Text style={styles.buttonText}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.expandableHeader}
                  onPress={() => toggleExpand(fertilizer._id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.arrowIcon}>{isExpanded ? '▼' : '▶'}</Text>
                  <Text style={styles.listItemText}>
                    <Text style={styles.label}>{fertilizer.name}</Text>
                  </Text>
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditClick(fertilizer)}
                      >
                        <Text style={styles.editButtonText}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteClick(fertilizer)}
                        disabled={deleteMutation.isPending}
                      >
                        <Text style={styles.deleteButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.listItemText}>
                      <Text style={styles.label}>NPK:</Text> {fertilizer.nitrogen ?? '?'}-{fertilizer.phosphorus ?? '?'}-{fertilizer.potassium ?? '?'}
                    </Text>
                    <Text style={styles.listItemText}>
                      {fertilizer.type}{fertilizer.isOrganic ? ' (Organic)' : ''}
                    </Text>
                    {fertilizer.notes && (
                      <Text style={styles.listItemText}>
                        <Text style={styles.label}>Notes:</Text> {fertilizer.notes}
                      </Text>
                    )}
                  </View>
                )}
              </>
            )}
          </View>
        )
      })}
    </View>
  );
}

function PlantsDisplay() {
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set())
  const [showForm, setShowForm] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [showChoreForm, setShowChoreForm] = React.useState<string | null>(null) // plantId
  const [editingChoreId, setEditingChoreId] = React.useState<string | null>(null)
  const [choreUseFertilizer, setChoreUseFertilizer] = React.useState(true)
  const [editChoreUseFertilizer, setEditChoreUseFertilizer] = React.useState(true)
  const [choreFormData, setChoreFormData] = React.useState({
    description: '',
    fertilizer: '',
    fertilizerAmount: '',
    recurAmount: '',
    recurUnit: '',
    notes: '',
  })
  const [editChoreFormData, setEditChoreFormData] = React.useState({
    description: '',
    fertilizer: '',
    fertilizerAmount: '',
    recurAmount: '',
    recurUnit: '',
    notes: '',
  })
  const [formData, setFormData] = React.useState({
    name: '',
    plantedAt: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
    notes: '',
  })
  const [editFormData, setEditFormData] = React.useState({
    name: '',
    plantedAt: '',
    notes: '',
  })

  const {
    data,
    isLoading,
    error,
    isError,
    refetch,
    isRefetching
  } = trpc.plants.list.useQuery({ q: ''}, {
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 1,
  });

  // Fetch fertilizers for chore form
  const { data: fertilizersData } = trpc.fertilizers.list.useQuery({ q: ''}, {
    retry: 1,
  });

  const createMutation = trpc.plants.create.useMutation({
    onSuccess: () => {
      refetch()
      setShowForm(false)
      setFormData({
        name: '',
        plantedAt: new Date().toISOString().split('T')[0],
        notes: '',
      })
    },
  })

  const updateMutation = trpc.plants.update.useMutation({
    onSuccess: () => {
      refetch()
      setEditingId(null)
      setEditFormData({
        name: '',
        plantedAt: '',
        notes: '',
      })
    },
  })

  const deleteMutation = trpc.plants.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const createChoreMutation = trpc.chores.create.useMutation({
    onSuccess: () => {
      refetch()
      setShowChoreForm(null)
      setChoreUseFertilizer(true)
      setChoreFormData({
        description: '',
        fertilizer: '',
        fertilizerAmount: '',
        recurAmount: '',
        recurUnit: '',
        notes: '',
      })
    },
  })

  const updateChoreMutation = trpc.chores.update.useMutation({
    onSuccess: () => {
      refetch()
      setEditingChoreId(null)
      setEditChoreUseFertilizer(true)
      setEditChoreFormData({
        description: '',
        fertilizer: '',
        fertilizerAmount: '',
        recurAmount: '',
        recurUnit: '',
        notes: '',
      })
    },
  })

  const deleteChoreMutation = trpc.chores.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.plantedAt) {
      return
    }

    // Get timezone offset in minutes (negative for timezones ahead of UTC)
    const timezoneOffset = new Date().getTimezoneOffset()

    createMutation.mutate({
      name: formData.name,
      plantedAt: formData.plantedAt, // Send as string, API will convert
      notes: formData.notes || undefined,
      clientTimezoneOffset: -timezoneOffset, // Negate because getTimezoneOffset returns opposite sign
    })
  }

  const handleEditSubmit = () => {
    if (!editingId || !editFormData.name || !editFormData.plantedAt) {
      return
    }

    // Get timezone offset in minutes (negative for timezones ahead of UTC)
    const timezoneOffset = new Date().getTimezoneOffset()

    updateMutation.mutate({
      id: editingId,
      name: editFormData.name,
      plantedAt: editFormData.plantedAt, // Send as string, API will convert
      notes: editFormData.notes || undefined,
      clientTimezoneOffset: -timezoneOffset, // Negate because getTimezoneOffset returns opposite sign
    })
  }

  const handleEditClick = (plant: NonNullable<typeof data>['plants'][0]) => {
    setEditingId(plant._id)
    // Convert UTC date from API to local date string for editing
    const localDate = plant.plantedAt
      ? new Date(plant.plantedAt).toLocaleDateString('en-US') // YYYY-MM-DD format
      : new Date().toLocaleDateString('en-US')
    setEditFormData({
      name: plant.name,
      plantedAt: localDate,
      notes: plant.notes || '',
    })
  }

  const handleDeleteClick = (plant: NonNullable<typeof data>['plants'][0]) => {
    Alert.alert(
      'Delete Plant',
      `Are you sure you want to delete ${plant.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate({ id: plant._id })
          },
        },
      ]
    )
  }

  const toggleExpand = (plantId: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(plantId)) {
        newSet.delete(plantId)
      } else {
        newSet.add(plantId)
      }
      return newSet
    })
  }

  const handleChoreSubmit = (plantId: string) => {
    if (choreUseFertilizer) {
      if (!choreFormData.fertilizer || !choreFormData.fertilizerAmount) {
        return
      }
    } else {
      if (!choreFormData.description) {
        return
      }
    }

    const timezoneOffset = new Date().getTimezoneOffset()

    createChoreMutation.mutate({
      plantId,
      description: choreUseFertilizer ? undefined : (choreFormData.description || undefined),
      fertilizer: choreUseFertilizer ? (choreFormData.fertilizer || undefined) : undefined,
      fertilizerAmount: choreUseFertilizer ? (choreFormData.fertilizerAmount || undefined) : undefined,
      recurAmount: choreFormData.recurAmount ? parseFloat(choreFormData.recurAmount) : undefined,
      recurUnit: choreFormData.recurUnit || undefined,
      notes: choreFormData.notes || undefined,
      clientTimezoneOffset: -timezoneOffset,
    })
  }

  const handleChoreEditSubmit = () => {
    if (!editingChoreId) {
      return
    }

    if (editChoreUseFertilizer) {
      if (!editChoreFormData.fertilizer || !editChoreFormData.fertilizerAmount) {
        return
      }
    } else {
      if (!editChoreFormData.description) {
        return
      }
    }

    const timezoneOffset = new Date().getTimezoneOffset()

    updateChoreMutation.mutate({
      id: editingChoreId,
      description: editChoreUseFertilizer ? undefined : (editChoreFormData.description || undefined),
      fertilizer: editChoreUseFertilizer ? (editChoreFormData.fertilizer || undefined) : undefined,
      fertilizerAmount: editChoreUseFertilizer ? (editChoreFormData.fertilizerAmount || undefined) : undefined,
      recurAmount: editChoreFormData.recurAmount ? parseFloat(editChoreFormData.recurAmount) : undefined,
      recurUnit: editChoreFormData.recurUnit || undefined,
      notes: editChoreFormData.notes || undefined,
      clientTimezoneOffset: -timezoneOffset,
    })
  }

  const handleChoreEditClick = (chore: NonNullable<typeof data>['plants'][0]['chores'][0]) => {
    setEditingChoreId(chore._id)
    const hasFertilizer = !!(chore.fertilizer && chore.fertilizerAmount)
    setEditChoreUseFertilizer(hasFertilizer)
    setEditChoreFormData({
      description: chore.description || '',
      fertilizer: chore.fertilizer?._id || '',
      fertilizerAmount: chore.fertilizerAmount || '',
      recurAmount: chore.recurAmount?.toString() || '',
      recurUnit: chore.recurUnit || '',
      notes: chore.notes || '',
    })
  }

  const handleChoreDeleteClick = (chore: NonNullable<typeof data>['plants'][0]['chores'][0], plantId: string) => {
    Alert.alert(
      'Delete Chore',
      `Are you sure you want to delete this chore?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteChoreMutation.mutate({ id: chore._id, plantId })
          },
        },
      ]
    )
  }

  if (isLoading) {
    return (
      <View style={styles.statusContainer}>
        <Text style={styles.loadingText}>Loading plants...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.statusContainer, styles.errorContainer]}>
        <Text style={styles.errorText}>
          Error: {error?.message || 'Unknown error'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.statusContainer, styles.successContainer]}>
      <View style={styles.header}>
        <Text style={styles.title}>Plants</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowForm(!showForm)}
          >
            <Text style={styles.buttonText}>
              {showForm ? 'Cancel' : '+ Add'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => refetch()}
            disabled={isRefetching}
          >
            <Text style={styles.buttonText}>
              {isRefetching ? 'Refreshing...' : 'Refresh'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Add New Plant</Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Planted At (YYYY-MM-DD)"
            value={formData.plantedAt}
            onChangeText={(text) => setFormData({ ...formData, plantedAt: text })}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Notes (optional)"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            multiline
            numberOfLines={3}
          />

          {createMutation.error && (
            <Text style={styles.errorText}>
              Error: {createMutation.error.message}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.submitButton, createMutation.isPending && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={createMutation.isPending}
          >
            <Text style={styles.buttonText}>
              {createMutation.isPending ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cancelButton, createMutation.isPending && styles.submitButtonDisabled]}
            onPress={() => setShowForm(false)}
            disabled={createMutation.isPending}
          >
            <Text style={styles.buttonText}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {!data?.plants?.length ? (
        <Text style={styles.listItemText}>No plants found.</Text>
      ) : data?.plants?.map((plant, index) => {
        const isExpanded = expandedIds.has(plant._id)
        const isEditing = editingId === plant._id

        return (
          <View key={plant._id} style={styles.listItem}>
            {isEditing ? (
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>Edit Plant</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  value={editFormData.name}
                  onChangeText={(text) => setEditFormData({ ...editFormData, name: text })}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Planted At (YYYY-MM-DD)"
                  value={editFormData.plantedAt}
                  onChangeText={(text) => setEditFormData({ ...editFormData, plantedAt: text })}
                />

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Notes (optional)"
                  value={editFormData.notes}
                  onChangeText={(text) => setEditFormData({ ...editFormData, notes: text })}
                  multiline
                  numberOfLines={3}
                />

                {updateMutation.error && (
                  <Text style={styles.errorText}>
                    Error: {updateMutation.error.message}
                  </Text>
                )}

                <TouchableOpacity
                  style={[styles.submitButton, updateMutation.isPending && styles.submitButtonDisabled]}
                  onPress={handleEditSubmit}
                  disabled={updateMutation.isPending}
                >
                  <Text style={styles.buttonText}>
                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cancelButton, updateMutation.isPending && styles.submitButtonDisabled]}
                  onPress={() => {
                    setEditingId(null)
                    setEditFormData({
                      name: '',
                      plantedAt: '',
                      notes: '',
                    })
                  }}
                  disabled={updateMutation.isPending}
                >
                  <Text style={styles.buttonText}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.expandableHeader}
                  onPress={() => toggleExpand(plant._id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.arrowIcon}>{isExpanded ? '▼' : '▶'}</Text>
                  <Text style={styles.listItemText}>
                    <Text style={styles.label}>{plant.name}</Text>
                  </Text>
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditClick(plant)}
                      >
                        <Text style={styles.editButtonText}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteClick(plant)}
                        disabled={deleteMutation.isPending}
                      >
                        <Text style={styles.deleteButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>

                    {plant.plantedAt && (
                      <Text style={styles.listItemText}>
                        <Text style={styles.label}>Planted {new Date(plant.plantedAt).toLocaleDateString('en-US')}</Text>
                      </Text>
                    )}
                    {plant.notes && (
                      <Text style={styles.listItemText}>
                        <Text style={styles.label}>Notes:</Text> {plant.notes}
                      </Text>
                    )}

                    <Text style={styles.listItemText}></Text>
                    <View style={styles.choresHeader}>
                      <Text style={styles.label}>Chores</Text>
                      <TouchableOpacity
                        style={styles.addChoreButton}
                        onPress={() => setShowChoreForm(plant._id)}
                      >
                        <Text style={styles.buttonText}>+ Add</Text>
                      </TouchableOpacity>
                    </View>

                    {showChoreForm === plant._id && (
                      <View style={styles.formContainer}>
                        <Text style={styles.formTitle}>Add New Chore</Text>

                        <View style={styles.switchContainer}>
                          <Text style={styles.switchLabel}>Fertilizer</Text>
                          <Switch
                            value={choreUseFertilizer}
                            onValueChange={(value) => setChoreUseFertilizer(value)}
                          />
                        </View>

                        {choreUseFertilizer ? (
                          <>
                            <Text style={styles.inputLabel}>Fertilizer *</Text>
                            <ScrollView style={styles.pickerContainer}>
                              {fertilizersData?.fertilizers.map((fertilizer) => (
                                <TouchableOpacity
                                  key={fertilizer._id}
                                  style={[
                                    styles.pickerOption,
                                    choreFormData.fertilizer === fertilizer._id && styles.pickerOptionSelected
                                  ]}
                                  onPress={() => setChoreFormData({ ...choreFormData, fertilizer: fertilizer._id })}
                                >
                                  <Text style={[
                                    styles.pickerOptionText,
                                    choreFormData.fertilizer === fertilizer._id && styles.pickerOptionTextSelected
                                  ]}>
                                    {fertilizer.name}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>

                            <Text style={styles.inputLabel}>Fertilizer Amount *</Text>
                            <TextInput
                              style={styles.input}
                              placeholder="Fertilizer Amount"
                              value={choreFormData.fertilizerAmount}
                              onChangeText={(text) => setChoreFormData({ ...choreFormData, fertilizerAmount: text })}
                            />
                          </>
                        ) : (
                          <>
                            <Text style={styles.inputLabel}>Description *</Text>
                            <TextInput
                              style={styles.input}
                              placeholder="Description"
                              value={choreFormData.description}
                              onChangeText={(text) => setChoreFormData({ ...choreFormData, description: text })}
                            />
                          </>
                        )}

                        <Text style={styles.inputLabel}>Every</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Recur Amount (number)"
                          value={choreFormData.recurAmount}
                          onChangeText={(text) => setChoreFormData({ ...choreFormData, recurAmount: text })}
                          keyboardType="numeric"
                        />
                        <ScrollView style={styles.pickerContainer}>
                          {[ 'day', 'week' ].map((unit) => (
                            <TouchableOpacity
                              key={unit}
                              style={[
                                styles.pickerOption,
                                choreFormData.recurUnit === unit && styles.pickerOptionSelected
                              ]}
                              onPress={() => setChoreFormData({ ...choreFormData, recurUnit: unit })}
                            >
                              <Text style={[
                                styles.pickerOptionText,
                                choreFormData.recurUnit === unit && styles.pickerOptionTextSelected
                              ]}>
                                {unit}{choreFormData.recurAmount === '1' ? '' : 's'}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>

                        <TextInput
                          style={[styles.input, styles.textArea]}
                          placeholder="Notes (optional)"
                          value={choreFormData.notes}
                          onChangeText={(text) => setChoreFormData({ ...choreFormData, notes: text })}
                          multiline
                          numberOfLines={3}
                        />

                        {createChoreMutation.error && (
                          <Text style={styles.errorText}>
                            Error: {createChoreMutation.error.message}
                          </Text>
                        )}

                        <TouchableOpacity
                          style={[styles.submitButton, createChoreMutation.isPending && styles.submitButtonDisabled]}
                          onPress={() => handleChoreSubmit(plant._id)}
                          disabled={createChoreMutation.isPending}
                        >
                          <Text style={styles.buttonText}>
                            {createChoreMutation.isPending ? 'Saving...' : 'Save'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.cancelButton, createChoreMutation.isPending && styles.submitButtonDisabled]}
                          onPress={() => {
                            setShowChoreForm(null)
                            setChoreUseFertilizer(true)
                            setChoreFormData({
                              description: '',
                              fertilizer: '',
                              fertilizerAmount: '',
                              recurAmount: '',
                              recurUnit: '',
                              notes: '',
                            })
                          }}
                          disabled={createChoreMutation.isPending}
                        >
                          <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {!plant.chores.length ? (
                      <Text style={styles.listItemText}>No chores found.</Text>
                    ) : plant.chores.map((chore, index) => {
                      const isEditingChore = editingChoreId === chore._id

                      return (
                        <View key={chore._id} style={styles.choreItem}>
                          {isEditingChore ? (
                            <View style={styles.formContainer}>
                              <Text style={styles.formTitle}>Edit Chore</Text>

                              <View style={styles.switchContainer}>
                                <Text style={styles.switchLabel}>Fertilizer</Text>
                                <Switch
                                  value={editChoreUseFertilizer}
                                  onValueChange={(value) => setEditChoreUseFertilizer(value)}
                                />
                              </View>

                              {editChoreUseFertilizer ? (
                                <>
                                  <Text style={styles.inputLabel}>Fertilizer *</Text>
                                  <ScrollView style={styles.pickerContainer}>
                                    {fertilizersData?.fertilizers.map((fertilizer) => (
                                      <TouchableOpacity
                                        key={fertilizer._id}
                                        style={[
                                          styles.pickerOption,
                                          editChoreFormData.fertilizer === fertilizer._id && styles.pickerOptionSelected
                                        ]}
                                        onPress={() => setEditChoreFormData({ ...editChoreFormData, fertilizer: fertilizer._id })}
                                      >
                                        <Text style={[
                                          styles.pickerOptionText,
                                          editChoreFormData.fertilizer === fertilizer._id && styles.pickerOptionTextSelected
                                        ]}>
                                          {fertilizer.name}
                                        </Text>
                                      </TouchableOpacity>
                                    ))}
                                  </ScrollView>

                                  <Text style={styles.inputLabel}>Fertilizer Amount *</Text>
                                  <TextInput
                                    style={styles.input}
                                    placeholder="Fertilizer Amount"
                                    value={editChoreFormData.fertilizerAmount}
                                    onChangeText={(text) => setEditChoreFormData({ ...editChoreFormData, fertilizerAmount: text })}
                                  />
                                </>
                              ) : (
                                <>
                                  <Text style={styles.inputLabel}>Description *</Text>
                                  <TextInput
                                    style={styles.input}
                                    placeholder="Description"
                                    value={editChoreFormData.description}
                                    onChangeText={(text) => setEditChoreFormData({ ...editChoreFormData, description: text })}
                                  />
                                </>
                              )}

                              <Text style={styles.inputLabel}>Every</Text>
                              <TextInput
                                style={styles.input}
                                placeholder="Recur Amount (number)"
                                value={editChoreFormData.recurAmount}
                                onChangeText={(text) => setEditChoreFormData({ ...editChoreFormData, recurAmount: text })}
                                keyboardType="numeric"
                              />
                              <ScrollView style={styles.pickerContainer}>
                                {[ 'day', 'week' ].map((unit) => (
                                  <TouchableOpacity
                                    key={unit}
                                    style={[
                                      styles.pickerOption,
                                      editChoreFormData.recurUnit === unit && styles.pickerOptionSelected
                                    ]}
                                    onPress={() => setEditChoreFormData({ ...editChoreFormData, recurUnit: unit })}
                                  >
                                    <Text style={[
                                      styles.pickerOptionText,
                                      editChoreFormData.recurUnit === unit && styles.pickerOptionTextSelected
                                    ]}>
                                      {unit}{editChoreFormData.recurAmount === '1' ? '' : 's'}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </ScrollView>

                              <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Notes (optional)"
                                value={editChoreFormData.notes}
                                onChangeText={(text) => setEditChoreFormData({ ...editChoreFormData, notes: text })}
                                multiline
                                numberOfLines={3}
                              />

                              {updateChoreMutation.error && (
                                <Text style={styles.errorText}>
                                  Error: {updateChoreMutation.error.message}
                                </Text>
                              )}

                              <TouchableOpacity
                                style={[styles.submitButton, updateChoreMutation.isPending && styles.submitButtonDisabled]}
                                onPress={handleChoreEditSubmit}
                                disabled={updateChoreMutation.isPending}
                              >
                                <Text style={styles.buttonText}>
                                  {updateChoreMutation.isPending ? 'Saving...' : 'Save'}
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[styles.cancelButton, updateChoreMutation.isPending && styles.submitButtonDisabled]}
                                onPress={() => {
                                  setEditingChoreId(null)
                                  setEditChoreUseFertilizer(true)
                                  setEditChoreFormData({
                                    description: '',
                                    fertilizer: '',
                                    fertilizerAmount: '',
                                    recurAmount: '',
                                    recurUnit: '',
                                    notes: '',
                                  })
                                }}
                                disabled={updateChoreMutation.isPending}
                              >
                                <Text style={styles.buttonText}>Cancel</Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <>
                              <View style={styles.choreHeader}>
                                <Text style={styles.listItemText}>
                                  <Text style={styles.label}>{(chore.fertilizer && `${chore.fertilizer.name}:`) || chore.description || 'Unknown'}</Text>{chore.fertilizerAmount && ` ${chore.fertilizerAmount}`}{chore.recurAmount ? ` every ${chore.recurAmount} ${chore.recurUnit}${chore.recurAmount === 1 ? '' : 's'}` : ''}
                                </Text>
                              </View>

                              <View style={styles.actionButtons}>
                                <TouchableOpacity
                                  style={styles.editButton}
                                  onPress={() => handleChoreEditClick(chore)}
                                >
                                  <Text style={styles.editButtonText}>✏️</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.deleteButton}
                                  onPress={() => handleChoreDeleteClick(chore, plant._id)}
                                  disabled={deleteChoreMutation.isPending}
                                >
                                  <Text style={styles.deleteButtonText}>✕</Text>
                                </TouchableOpacity>
                              </View>

                              {chore.notes && (
                                <Text style={styles.listItemText}>
                                  {chore.notes}
                                </Text>
                              )}
                              <Text style={styles.listItemText}>
                                <Text style={styles.label}>Next Date:</Text> <Text style={chore.nextDate && new Date(chore.nextDate) < new Date() ? styles.errorText : styles.listItemText}>{chore.nextDate ? new Date(chore.nextDate).toLocaleDateString('en-US') : 'unknown'}</Text>
                              </Text>
                              <Text style={styles.listItemText}>
                                <Text style={styles.label}>History:</Text>
                              </Text>
                              {chore.logs.map((log) => (
                                <Text key={log._id} style={styles.listItemText}>
                                  <Text style={styles.label}>{log.doneAt ? new Date(log.doneAt).toLocaleDateString('en-US') : 'unknown'}</Text>{log.fertilizerAmount ? ` ${log.fertilizerAmount}` : ''}{log.notes ? ` (${log.notes})` : ''}
                                </Text>
                              ))}
                            </>
                          )}
                        </View>
                      )
                    })}
                  </View>
                )}
              </>
            )}
          </View>
        )
      })}
    </View>
  );
}

function ChoresDisplay() {
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set())
  const [showForm, setShowForm] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [useFertilizer, setUseFertilizer] = React.useState(true)
  const [editUseFertilizer, setEditUseFertilizer] = React.useState(true)
  const [formData, setFormData] = React.useState({
    plantId: '',
    description: '',
    fertilizer: '',
    fertilizerAmount: '',
    recurAmount: '',
    recurUnit: '',
    notes: '',
  })
  const [editFormData, setEditFormData] = React.useState({
    description: '',
    fertilizer: '',
    fertilizerAmount: '',
    recurAmount: '',
    recurUnit: '',
    notes: '',
  })

  const {
    data,
    isLoading,
    error,
    isError,
    refetch,
    isRefetching
  } = trpc.chores.list.useQuery({ q: ''}, {
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 1,
  });

  // Fetch plants and fertilizers for forms
  const { data: plantsData } = trpc.plants.list.useQuery({ q: ''}, {
    retry: 1,
  });
  const { data: fertilizersData } = trpc.fertilizers.list.useQuery({ q: ''}, {
    retry: 1,
  });

  const createMutation = trpc.chores.create.useMutation({
    onSuccess: () => {
      refetch()
      setShowForm(false)
      setUseFertilizer(true)
      setFormData({
        plantId: '',
        description: '',
        fertilizer: '',
        fertilizerAmount: '',
        recurAmount: '',
        recurUnit: '',
        notes: '',
      })
    },
  })

  const updateMutation = trpc.chores.update.useMutation({
    onSuccess: () => {
      refetch()
      setEditingId(null)
      setEditUseFertilizer(true)
      setEditFormData({
        description: '',
        fertilizer: '',
        fertilizerAmount: '',
        recurAmount: '',
        recurUnit: '',
        notes: '',
      })
    },
  })

  const deleteMutation = trpc.chores.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const handleSubmit = () => {
    if (!formData.plantId) {
      return
    }

    if (useFertilizer) {
      if (!formData.fertilizer || !formData.fertilizerAmount) {
        return
      }
    } else {
      if (!formData.description) {
        return
      }
    }

    const timezoneOffset = new Date().getTimezoneOffset()

    createMutation.mutate({
      plantId: formData.plantId,
      description: useFertilizer ? undefined : (formData.description || undefined),
      fertilizer: useFertilizer ? (formData.fertilizer || undefined) : undefined,
      fertilizerAmount: useFertilizer ? (formData.fertilizerAmount || undefined) : undefined,
      recurAmount: formData.recurAmount ? parseFloat(formData.recurAmount) : undefined,
      recurUnit: formData.recurUnit || undefined,
      notes: formData.notes || undefined,
      clientTimezoneOffset: -timezoneOffset,
    })
  }

  const handleEditSubmit = () => {
    if (!editingId) {
      return
    }

    if (editUseFertilizer) {
      if (!editFormData.fertilizer || !editFormData.fertilizerAmount) {
        return
      }
    } else {
      if (!editFormData.description) {
        return
      }
    }

    const timezoneOffset = new Date().getTimezoneOffset()

    updateMutation.mutate({
      id: editingId,
      description: editUseFertilizer ? undefined : (editFormData.description || undefined),
      fertilizer: editUseFertilizer ? (editFormData.fertilizer || undefined) : undefined,
      fertilizerAmount: editUseFertilizer ? (editFormData.fertilizerAmount || undefined) : undefined,
      recurAmount: editFormData.recurAmount ? parseFloat(editFormData.recurAmount) : undefined,
      recurUnit: editFormData.recurUnit || undefined,
      notes: editFormData.notes || undefined,
      clientTimezoneOffset: -timezoneOffset,
    })
  }

  const handleEditClick = (chore: NonNullable<typeof data>['chores'][0]) => {
    setEditingId(chore._id)
    const hasFertilizer = !!((chore.fertilizer as any)?._id && chore.fertilizerAmount)
    setEditUseFertilizer(hasFertilizer)
    setEditFormData({
      description: chore.description || '',
      fertilizer: (chore.fertilizer as any)?._id || '',
      fertilizerAmount: chore.fertilizerAmount || '',
      recurAmount: chore.recurAmount?.toString() || '',
      recurUnit: chore.recurUnit || '',
      notes: chore.notes || '',
    })
  }

  const handleDeleteClick = (chore: NonNullable<typeof data>['chores'][0]) => {
    const plantId = (chore.plant as any)?._id
    if (!plantId) {
      Alert.alert('Error', 'Cannot delete: Plant information missing')
      return
    }

    Alert.alert(
      'Delete Chore',
      `Are you sure you want to delete this chore?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate({ id: chore._id, plantId })
          },
        },
      ]
    )
  }

  const toggleExpand = (choreId: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(choreId)) {
        newSet.delete(choreId)
      } else {
        newSet.add(choreId)
      }
      return newSet
    })
  }

  if (isLoading) {
    return (
      <View style={styles.statusContainer}>
        <Text style={styles.loadingText}>Loading chores...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.statusContainer, styles.errorContainer]}>
        <Text style={styles.errorText}>
          Error: {error?.message || 'Unknown error'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.statusContainer, styles.successContainer]}>
      <View style={styles.header}>
        <Text style={styles.title}>Chores</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowForm(!showForm)}
          >
            <Text style={styles.buttonText}>
              {showForm ? 'Cancel' : '+ Add'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => refetch()}
            disabled={isRefetching}
          >
            <Text style={styles.buttonText}>
              {isRefetching ? 'Refreshing...' : 'Refresh'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Add New Chore</Text>

          <Text style={styles.inputLabel}>Plant *</Text>
          <ScrollView style={styles.pickerContainer}>
            {plantsData?.plants.map((plant) => (
              <TouchableOpacity
                key={plant._id}
                style={[
                  styles.pickerOption,
                  formData.plantId === plant._id && styles.pickerOptionSelected
                ]}
                onPress={() => setFormData({ ...formData, plantId: plant._id })}
              >
                <Text style={[
                  styles.pickerOptionText,
                  formData.plantId === plant._id && styles.pickerOptionTextSelected
                ]}>
                  {plant.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Fertilizer</Text>
            <Switch
              value={useFertilizer}
              onValueChange={(value) => setUseFertilizer(value)}
            />
          </View>

          {useFertilizer ? (
            <>
              <Text style={styles.inputLabel}>Fertilizer *</Text>
              <ScrollView style={styles.pickerContainer}>
                {fertilizersData?.fertilizers.map((fertilizer) => (
                  <TouchableOpacity
                    key={fertilizer._id}
                    style={[
                      styles.pickerOption,
                      formData.fertilizer === fertilizer._id && styles.pickerOptionSelected
                    ]}
                    onPress={() => setFormData({ ...formData, fertilizer: fertilizer._id })}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      formData.fertilizer === fertilizer._id && styles.pickerOptionTextSelected
                    ]}>
                      {fertilizer.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Fertilizer Amount *</Text>
              <TextInput
                style={styles.input}
                placeholder="Fertilizer Amount"
                value={formData.fertilizerAmount}
                onChangeText={(text) => setFormData({ ...formData, fertilizerAmount: text })}
              />
            </>
          ) : (
            <>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={styles.input}
                placeholder="Description"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
              />
            </>
          )}

          <Text style={styles.inputLabel}>Every</Text>
          <TextInput
            style={styles.input}
            placeholder="Recur Amount (number)"
            value={formData.recurAmount}
            onChangeText={(text) => setFormData({ ...formData, recurAmount: text })}
            keyboardType="numeric"
          />
          <ScrollView style={styles.pickerContainer}>
            {[ 'day', 'week' ].map((unit) => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.pickerOption,
                  formData.recurUnit === unit && styles.pickerOptionSelected
                ]}
                onPress={() => setFormData({ ...formData, recurUnit: unit })}
              >
                <Text style={[
                  styles.pickerOptionText,
                  formData.recurUnit === unit && styles.pickerOptionTextSelected
                ]}>
                  {unit}{formData.recurAmount === '1' ? '' : 's'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Notes (optional)"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            multiline
            numberOfLines={3}
          />

          {createMutation.error && (
            <Text style={styles.errorText}>
              Error: {createMutation.error.message}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.submitButton, createMutation.isPending && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={createMutation.isPending}
          >
            <Text style={styles.buttonText}>
              {createMutation.isPending ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cancelButton, createMutation.isPending && styles.submitButtonDisabled]}
            onPress={() => {
              setShowForm(false)
              setUseFertilizer(true)
              setFormData({
                plantId: '',
                description: '',
                fertilizer: '',
                fertilizerAmount: '',
                recurAmount: '',
                recurUnit: '',
                notes: '',
              })
            }}
            disabled={createMutation.isPending}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {!data?.chores?.length ? (
        <Text style={styles.listItemText}>No chores found.</Text>
      ) : data?.chores?.map((chore, index) => {
        const isExpanded = expandedIds.has(chore._id)
        const isEditing = editingId === chore._id

        return (
          <View key={chore._id} style={styles.listItem}>
            {isEditing ? (
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>Edit Chore</Text>

                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Fertilizer</Text>
                  <Switch
                    value={editUseFertilizer}
                    onValueChange={(value) => setEditUseFertilizer(value)}
                  />
                </View>

                {editUseFertilizer ? (
                  <>
                    <Text style={styles.inputLabel}>Fertilizer *</Text>
                    <ScrollView style={styles.pickerContainer}>
                      {fertilizersData?.fertilizers.map((fertilizer) => (
                        <TouchableOpacity
                          key={fertilizer._id}
                          style={[
                            styles.pickerOption,
                            editFormData.fertilizer === fertilizer._id && styles.pickerOptionSelected
                          ]}
                          onPress={() => setEditFormData({ ...editFormData, fertilizer: fertilizer._id })}
                        >
                          <Text style={[
                            styles.pickerOptionText,
                            editFormData.fertilizer === fertilizer._id && styles.pickerOptionTextSelected
                          ]}>
                            {fertilizer.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <Text style={styles.inputLabel}>Fertilizer Amount *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Fertilizer Amount"
                      value={editFormData.fertilizerAmount}
                      onChangeText={(text) => setEditFormData({ ...editFormData, fertilizerAmount: text })}
                    />
                  </>
                ) : (
                  <>
                    <Text style={styles.inputLabel}>Description *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Description"
                      value={editFormData.description}
                      onChangeText={(text) => setEditFormData({ ...editFormData, description: text })}
                    />
                  </>
                )}

                <Text style={styles.inputLabel}>Every</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Recur Amount (number)"
                  value={editFormData.recurAmount}
                  onChangeText={(text) => setEditFormData({ ...editFormData, recurAmount: text })}
                  keyboardType="numeric"
                />
                <ScrollView style={styles.pickerContainer}>
                  {[ 'day', 'week' ].map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      style={[
                        styles.pickerOption,
                        editFormData.recurUnit === unit && styles.pickerOptionSelected
                      ]}
                      onPress={() => setEditFormData({ ...editFormData, recurUnit: unit })}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        editFormData.recurUnit === unit && styles.pickerOptionTextSelected
                      ]}>
                        {unit}{editFormData.recurAmount === '1' ? '' : 's'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Notes (optional)"
                  value={editFormData.notes}
                  onChangeText={(text) => setEditFormData({ ...editFormData, notes: text })}
                  multiline
                  numberOfLines={3}
                />

                {updateMutation.error && (
                  <Text style={styles.errorText}>
                    Error: {updateMutation.error.message}
                  </Text>
                )}

                <TouchableOpacity
                  style={[styles.submitButton, updateMutation.isPending && styles.submitButtonDisabled]}
                  onPress={handleEditSubmit}
                  disabled={updateMutation.isPending}
                >
                  <Text style={styles.buttonText}>
                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cancelButton, updateMutation.isPending && styles.submitButtonDisabled]}
                  onPress={() => {
                    setEditingId(null)
                    setEditUseFertilizer(true)
                    setEditFormData({
                      description: '',
                      fertilizer: '',
                      fertilizerAmount: '',
                      recurAmount: '',
                      recurUnit: '',
                      notes: '',
                    })
                  }}
                  disabled={updateMutation.isPending}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.expandableHeader}
                  onPress={() => toggleExpand(chore._id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.arrowIcon}>{isExpanded ? '▼' : '▶'}</Text>
                  <Text style={styles.listItemText}>
                    <Text style={styles.label}>
                      <Text style={chore.nextDate && new Date(chore.nextDate) < new Date() ? styles.errorText : styles.listItemText}>{chore.nextDate ? new Date(chore.nextDate).toLocaleDateString('en-US') : 'unknown'}</Text> {chore.plant?.name || 'Unknown Plant'} - {chore.fertilizer?.name || chore.description || 'Unknown Fertilizer'}
                    </Text>
                  </Text>
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditClick(chore)}
                      >
                        <Text style={styles.editButtonText}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteClick(chore)}
                        disabled={deleteMutation.isPending}
                      >
                        <Text style={styles.deleteButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.listItemText}>
                      <Text style={styles.label}>Plant:</Text> {chore.plant?.name || 'Unknown'}
                    </Text>
                    <Text style={styles.listItemText}>
                      <Text style={styles.label}>Fertilizer:</Text> {chore.fertilizer?.name || ''}
                    </Text>
                    <Text style={styles.listItemText}>
                      <Text style={styles.label}>Description:</Text> {chore.description || ''}
                    </Text>
                    {chore.fertilizerAmount && (
                      <Text style={styles.listItemText}>
                        <Text style={styles.label}>Amount:</Text> {chore.fertilizerAmount}
                      </Text>
                    )}
                    {chore.recurAmount && chore.recurUnit && (
                      <Text style={styles.listItemText}>
                        <Text style={styles.label}>Recurrence:</Text> Every {chore.recurAmount} {chore.recurUnit}{chore.recurAmount === 1 ? '' : 's'}
                      </Text>
                    )}
                    {chore.nextDate && (
                      <Text style={styles.listItemText}>
                        <Text style={styles.label}>Next Date:</Text> <Text style={chore.nextDate < new Date() ? styles.errorText : styles.listItemText}>{new Date(chore.nextDate).toLocaleDateString('en-US')}</Text>
                      </Text>
                    )}
                    {chore.notes && (
                      <Text style={styles.listItemText}>
                        <Text style={styles.label}>Notes:</Text> {chore.notes}
                      </Text>
                    )}
                  </View>
                )}
              </>
            )}
          </View>
        )
      })}
    </View>
  );
}

function ToDoDisplay() {
  const [checkedIds, setCheckedIds] = React.useState<Set<string>>(new Set())
  const [modalVisible, setModalVisible] = React.useState(false)
  const [selectedChore, setSelectedChore] = React.useState<NonNullable<typeof data>['chores'][0] | null>(null)
  const [choreLogFormData, setChoreLogFormData] = React.useState({
    fertilizerAmount: '',
    doneAt: '',
    notes: '',
  })

  const {
    data,
    isLoading,
    error,
    isError,
    refetch,
    isRefetching
  } = trpc.chores.list.useQuery({ q: ''}, {
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 1,
  });

  const createChoreLogMutation = trpc.choreLogs.create.useMutation({
    onSuccess: (_, variables) => {
      refetch()
      setModalVisible(false)
      // Remove from checked set after successful creation to uncheck the checkbox
      setCheckedIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(variables.choreId)
        return newSet
      })
      setSelectedChore(null)
      setChoreLogFormData({
        fertilizerAmount: '',
        doneAt: '',
        notes: '',
      })
    },
  })

  const handleCheckboxToggle = (chore: NonNullable<typeof data>['chores'][0]) => {
    const isChecked = checkedIds.has(chore._id)

    if (isChecked) {
      // Uncheck - remove from checked set
      setCheckedIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(chore._id)
        return newSet
      })
    } else {
      // Check - open modal with form
      setSelectedChore(chore)
      setChoreLogFormData({
        fertilizerAmount: chore.fertilizerAmount || '',
        doneAt: new Date().toISOString().split('T')[0], // Default to today in YYYY-MM-DD format
        notes: '',
      })
      setModalVisible(true)
    }
  }

  const handleChoreLogSubmit = () => {
    if (!selectedChore) {
      return
    }

    const timezoneOffset = new Date().getTimezoneOffset()
    createChoreLogMutation.mutate({
      choreId: selectedChore._id,
      fertilizerAmount: selectedChore.fertilizerAmount ? (choreLogFormData.fertilizerAmount || undefined) : undefined,
      doneAt: choreLogFormData.doneAt || undefined,
      notes: choreLogFormData.notes || undefined,
      clientTimezoneOffset: -timezoneOffset,
    })
  }

  const handleModalCancel = () => {
    setModalVisible(false)
    setSelectedChore(null)
    setChoreLogFormData({
      fertilizerAmount: '',
      doneAt: '',
      notes: '',
    })
  }

  if (isLoading) {
    return (
      <View style={styles.statusContainer}>
        <Text style={styles.loadingText}>Loading to do items...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.statusContainer, styles.errorContainer]}>
        <Text style={styles.errorText}>
          Error: {error?.message || 'Unknown error'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.statusContainer, styles.successContainer]}>
      <View style={styles.header}>
        <Text style={styles.title}>To Do</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => refetch()}
          disabled={isRefetching}
        >
          <Text style={styles.buttonText}>
            {isRefetching ? 'Refreshing...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      {!data?.chores?.length ? (
        <Text style={styles.listItemText}>No to do items found.</Text>
      ) : data?.chores?.map((chore, index) => {
        const isChecked = checkedIds.has(chore._id)
        const dateStr = chore.nextDate ? new Date(chore.nextDate).toLocaleDateString('en-US') : '(No date)'

        // Check if the date is greater than today (future date) or before today (past date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const nextDate = chore.nextDate ? new Date(chore.nextDate) : null
        if (nextDate) {
          nextDate.setHours(0, 0, 0, 0)
        }
        const isFutureDate = nextDate && nextDate > today
        const isPastDate = nextDate && nextDate < today

        return (
          <View key={chore._id} style={styles.listItem}>
            <View style={styles.todoRow}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => handleCheckboxToggle(chore)}
                disabled={createChoreLogMutation.isPending}
              >
                <Text style={[styles.checkboxText, isFutureDate && styles.futureTodoText]}>{isChecked ? '☑' : '☐'}</Text>
              </TouchableOpacity>
              <View style={styles.todoContent}>
                <Text style={[styles.listItemText, isFutureDate && styles.futureTodoText]}>
                  <Text style={[styles.label, isFutureDate && styles.futureTodoText]}>
                    <Text style={isPastDate ? styles.errorText : undefined}>{dateStr}</Text>{' '}{chore.plant?.name || 'Unknown Plant'} - {chore.fertilizer?.name || chore.description || 'Unknown Fertilizer'}
                  </Text>
                </Text>
                {chore.fertilizerAmount && (
                  <Text style={[styles.listItemText, isFutureDate && styles.futureTodoText]}>
                    {chore.fertilizerAmount}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )
      })}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleModalCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.formTitle}>Complete Chore</Text>

              {selectedChore?.fertilizerAmount && (
                <>
                  <Text style={styles.inputLabel}>Fertilizer Amount</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Fertilizer Amount"
                    value={choreLogFormData.fertilizerAmount}
                    onChangeText={(text) => setChoreLogFormData({ ...choreLogFormData, fertilizerAmount: text })}
                  />
                </>
              )}

              <Text style={styles.inputLabel}>Done At</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={choreLogFormData.doneAt}
                onChangeText={(text) => setChoreLogFormData({ ...choreLogFormData, doneAt: text })}
              />

              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Notes (optional)"
                value={choreLogFormData.notes}
                onChangeText={(text) => setChoreLogFormData({ ...choreLogFormData, notes: text })}
                multiline
                numberOfLines={3}
              />

              {createChoreLogMutation.error && (
                <Text style={styles.errorText}>
                  Error: {createChoreLogMutation.error.message}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.submitButton, createChoreLogMutation.isPending && styles.submitButtonDisabled]}
                onPress={handleChoreLogSubmit}
                disabled={createChoreLogMutation.isPending}
              >
                <Text style={styles.buttonText}>
                  {createChoreLogMutation.isPending ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelButton, createChoreLogMutation.isPending && styles.submitButtonDisabled]}
                onPress={handleModalCancel}
                disabled={createChoreLogMutation.isPending}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  statusContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  successContainer: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#155724',
  },
  statusInfo: {
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#155724',
  },
  listItem: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 8,
    marginTop: 8,
  },
  expandableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowIcon: {
    fontSize: 12,
    color: '#155724',
    marginRight: 8,
    width: 16,
  },
  expandedContent: {
    marginTop: 8,
    paddingLeft: 24,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  editButton: {
    padding: 4,
  },
  editButtonText: {
    fontSize: 16,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 18,
    color: '#dc3545',
    fontWeight: 'bold',
  },
  listItemText: {
    fontSize: 14,
    color: '#155724',
  },
  label: {
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#721c24',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  refreshButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  formContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#155724',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  typeButtonRight: {
    marginLeft: 8,
  },
  typeButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#155724',
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#6c757d',
    opacity: 0.6,
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  choresHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  addChoreButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  choreItem: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  choreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#155724',
    marginBottom: 8,
  },
  pickerContainer: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  pickerOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pickerOptionSelected: {
    backgroundColor: '#007bff',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#333',
  },
  pickerOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  todoContent: {
    flex: 1,
    marginLeft: 8,
  },
  futureTodoText: {
    opacity: 0.75,
  },
  checkbox: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxText: {
    fontSize: 20,
    color: '#155724',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
});