import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { goalService } from '../services/api';

interface Goal {
  id: number;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await goalService.getGoals();
      setGoals(response.goals || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  // Refresh goals when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [loadGoals])
  );

  // Calculate statistics
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const inProgressGoals = goals.filter(g => g.status === 'in_progress').length;
  const notStartedGoals = goals.filter(g => g.status === 'not_started').length;
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // Get recent goals (last 3)
  const recentGoals = goals.slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#34C759';
      case 'in_progress':
        return '#FF9500';
      case 'not_started':
        return '#8E8E93';
      default:
        return '#8E8E93';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'in_progress':
        return 'time';
      case 'not_started':
        return 'ellipse-outline';
      default:
        return 'ellipse-outline';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.welcome}>Welcome back, {user?.name || 'User'}!</Text>
          <Text style={styles.subtitle}>Let's track your career goals</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : (
            <>
              {/* Statistics Section */}
              <View style={styles.statsSection}>
                <Text style={styles.sectionTitle}>Your Progress</Text>

                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
                      <Ionicons name="flag" size={24} color="#007AFF" />
                    </View>
                    <Text style={styles.statValue}>{totalGoals}</Text>
                    <Text style={styles.statLabel}>Total Goals</Text>
                  </View>

                  <View style={styles.statCard}>
                    <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
                      <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                    </View>
                    <Text style={styles.statValue}>{completedGoals}</Text>
                    <Text style={styles.statLabel}>Completed</Text>
                  </View>

                  <View style={styles.statCard}>
                    <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
                      <Ionicons name="time" size={24} color="#FF9500" />
                    </View>
                    <Text style={styles.statValue}>{inProgressGoals}</Text>
                    <Text style={styles.statLabel}>In Progress</Text>
                  </View>
                </View>

                {/* Completion Rate */}
                <View style={styles.completionCard}>
                  <View style={styles.completionHeader}>
                    <Text style={styles.completionTitle}>Completion Rate</Text>
                    <Text style={styles.completionPercentage}>{completionRate}%</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBarFill, { width: `${completionRate}%` }]} />
                  </View>
                </View>
              </View>

              {/* Recent Goals Section */}
              {recentGoals.length > 0 && (
                <View style={styles.recentSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Goals</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Goals')}>
                      <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                  </View>

                  {recentGoals.map((goal) => (
                    <TouchableOpacity
                      key={goal.id}
                      style={styles.goalCard}
                      onPress={() => navigation.navigate('GoalDetail', { goalId: goal.id })}
                    >
                      <View style={styles.goalHeader}>
                        <Ionicons
                          name={getStatusIcon(goal.status) as any}
                          size={20}
                          color={getStatusColor(goal.status)}
                        />
                        <Text style={styles.goalTitle} numberOfLines={1}>
                          {goal.title}
                        </Text>
                      </View>
                      {goal.description && (
                        <Text style={styles.goalDescription} numberOfLines={2}>
                          {goal.description}
                        </Text>
                      )}
                      <View style={styles.goalFooter}>
                        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(goal.status)}15` }]}>
                          <Text style={[styles.statusText, { color: getStatusColor(goal.status) }]}>
                            {goal.status.replace('_', ' ')}
                          </Text>
                        </View>
                        <Text style={styles.progressText}>{goal.progress}%</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Empty State */}
              {totalGoals === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="flag-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyTitle}>No goals yet</Text>
                  <Text style={styles.emptySubtitle}>Start by creating your first career goal</Text>
                  <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => navigation.navigate('Goals')}
                  >
                    <Text style={styles.createButtonText}>Create Goal</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  welcome: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  completionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  completionPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  recentSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  goalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  goalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

