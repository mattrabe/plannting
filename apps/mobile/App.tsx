import React from 'react'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native'
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

            <FertilizersDisplay />

            <PlantsDisplay />

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

  const handleSubmit = () => {
    if (!formData.name || !formData.plantedAt) {
      return
    }

    createMutation.mutate({
      name: formData.name,
      plantedAt: new Date(formData.plantedAt),
      notes: formData.notes || undefined,
    })
  }

  const handleEditSubmit = () => {
    if (!editingId || !editFormData.name || !editFormData.plantedAt) {
      return
    }

    updateMutation.mutate({
      id: editingId,
      name: editFormData.name,
      plantedAt: new Date(editFormData.plantedAt),
      notes: editFormData.notes || undefined,
    })
  }

  const handleEditClick = (plant: NonNullable<typeof data>['plants'][0]) => {
    setEditingId(plant._id)
    setEditFormData({
      name: plant.name,
      plantedAt: plant.plantedAt ? new Date(plant.plantedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
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
                    <Text style={styles.listItemText}>
                      <Text style={styles.label}>Planted At:</Text> {plant.plantedAt?.toLocaleDateString('en-US') || 'unknown'}
                    </Text>
                    {plant.notes && (
                      <Text style={styles.listItemText}>
                        <Text style={styles.label}>Notes:</Text> {plant.notes}
                      </Text>
                    )}

                    <Text style={styles.listItemText}></Text>
                    <Text style={styles.label}>Chores</Text>
                    {!plant.chores.length ? (
                      <Text style={styles.listItemText}>No chores found.</Text>
                    ) : plant.chores.map((chore, index) => (
                      <View key={chore._id}>
                        <Text style={styles.listItemText}>
                          <Text style={styles.label}>{chore.fertilizer.name}:</Text> {chore.fertilizerAmount} every {chore.recurAmount} {chore.recurUnit}
                        </Text>
                        <Text style={styles.listItemText}>
                          {chore.notes}
                        </Text>
                        <Text style={styles.listItemText}>
                          <Text style={styles.label}>Next Date:</Text> {chore.recurNextDate?.toLocaleString('en-US') || 'unknown'}
                        </Text>
                        <Text style={styles.listItemText}>
                          <Text style={styles.label}>History:</Text> unknown
                        </Text>
                      </View>
                    ))}
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
    marginTop: 8,
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
});