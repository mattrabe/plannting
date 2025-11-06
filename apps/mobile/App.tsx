import React from 'react'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
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
            <Text style={styles.subtitle}>MongoDB Status Monitor</Text>

            <StatusDisplay />

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

function StatusDisplay() {
  const {
    data: status,
    isLoading,
    error,
    isError,
    refetch,
    isRefetching
  } = trpc.status.useQuery(undefined, {
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
        <Text style={styles.title}>API Status</Text>
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
          <Text style={styles.label}>MongoDB Status:</Text> {status?.db.mongo.status}
        </Text>
        <Text style={styles.statusText}>
          <Text style={styles.label}>Timestamp:</Text> {status?.timestamp}
        </Text>
      </View>
    </View>
  );
}

function FertilizersDisplay() {
  const {
    data,
    isLoading,
    error,
    isError,
    refetch,
    isRefetching
  } = trpc.getFertilizers.useQuery({ q: ''}, {
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 1,
  });

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

      {!data?.fertilizers?.length ? (
        <Text style={styles.listItemText}>No fertilizers found.</Text>
      ) : data?.fertilizers?.map((fertilizer, index) => (
        <View key={fertilizer._id} style={styles.listItem}>
          <Text style={styles.listItemText}>
            <Text style={styles.label}>Name:</Text> {fertilizer.name}, {fertilizer.type}{fertilizer.isOrganic ? ' (Organic)' : ''}
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
  } = trpc.getPlants.useQuery({ q: ''}, {
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
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
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
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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