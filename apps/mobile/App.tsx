import React from 'react'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native'
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

            <HealthDisplay />

            <FertilizersDisplay />

            <PlantsDisplay />

            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>About</Text>
              <Text style={styles.infoText}>
                This mobile app connects to the API
                to monitor MongoDB connection status in real-time using tRPC.
              </Text>
            </View>
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
    <View style={[styles.statusContainer, styles.successContainer]}>
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
  const [formData, setFormData] = React.useState({
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
              {createMutation.isPending ? 'Creating...' : 'Create Fertilizer'}
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
      ) : data?.fertilizers?.map((fertilizer, index) => (
        <View key={fertilizer._id} style={styles.listItem}>
          <Text style={styles.listItemText}>
            <Text style={styles.label}>{fertilizer.name} {fertilizer.nitrogen ?? '?'}-{fertilizer.phosphorus ?? '?'}-{fertilizer.potassium ?? '?'}</Text>, {fertilizer.type}{fertilizer.isOrganic ? ' (Organic)' : ''}
          </Text>
          <Text style={styles.listItemText}>
            <Text style={styles.label}>Notes:</Text> {fertilizer.notes}
          </Text>
        </View>
      ))}
    </View>
  );
}

function PlantsDisplay() {
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

      {!data?.plants?.length ? (
        <Text style={styles.listItemText}>No plants found.</Text>
      ) : data?.plants?.map((plant, index) => (
        <View key={plant._id} style={styles.listItem}>
          <Text style={styles.listItemText}>
            <Text style={styles.label}>Name:</Text> {plant.name}
          </Text>
          <Text style={styles.listItemText}>
            <Text style={styles.label}>Planted At:</Text> {plant.plantedAt?.toLocaleDateString('en-US') || 'unknown'}
          </Text>

          <Text style={styles.listItemText}></Text>
          <Text style={styles.label}>Activities ({plant.activities.length}):</Text>
          {plant.activities.map((activity, index) => (
            <View key={activity._id}>
              <Text style={styles.listItemText}>
                <Text style={styles.label}>{activity.fertilizer.name}:</Text> {activity.fertilizerAmount} every {activity.recurAmount} {activity.recurUnit}
              </Text>
              <Text style={styles.listItemText}>
                {activity.notes}
              </Text>
              <Text style={styles.listItemText}>
                <Text style={styles.label}>Next Date:</Text> {activity.recurNextDate?.toLocaleString('en-US') || 'unknown'}
              </Text>
              <Text style={styles.listItemText}>
                <Text style={styles.label}>History:</Text> unknown
              </Text>
            </View>
          ))}
        </View>
      ))}
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
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
});