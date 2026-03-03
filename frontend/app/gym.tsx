import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Linking,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../src/context/ThemeContext';

// Frankie's avatar
const FRANKIE_AVATAR = '/images/frankie.png';

// 12-Week Programme Data
const PROGRAMME_PHASES = [
  {
    phase: 1,
    name: 'Foundation',
    weeks: '1-4',
    frequency: '3 sessions/week',
    focus: 'Form, consistency, aerobic base',
    color: '#22c55e',
    workouts: [
      { day: 1, name: 'Conditioning', exercises: '20-30 min brisk walk/jog, 3 rounds: 10 press-ups, 15 squats, 20 sec plank' },
      { day: 2, name: 'Strength Basics', exercises: '4 rounds: 8-12 push-ups, 12 lunges, 10 sit-ups' },
      { day: 3, name: 'Engine Builder', exercises: '25 min intervals with 5 x 30 sec faster bursts' },
    ]
  },
  {
    phase: 2,
    name: 'Development',
    weeks: '5-8',
    frequency: '4 sessions/week',
    focus: 'Strength + Intervals',
    color: '#f59e0b',
    workouts: [
      { day: 1, name: 'Strength Circuit', exercises: '5 rounds: 15 push-ups, 20 squats, 15 sit-ups, 30 sec plank' },
      { day: 2, name: 'Interval Conditioning', exercises: '30 min jog with 6 x 1 min fast / 1 min slow' },
      { day: 3, name: 'Functional Strength', exercises: 'Step-ups, pull movements, core rotation' },
      { day: 4, name: 'Graft Session', exercises: '35 min steady cardio with 3 x 60 sec hard effort' },
    ]
  },
  {
    phase: 3,
    name: 'Resilience',
    weeks: '9-12',
    frequency: '4-5 sessions/week',
    focus: 'Peak performance',
    color: '#ef4444',
    workouts: [
      { day: 1, name: 'Loaded Circuit', exercises: '6 rounds: 20 push-ups, 25 squats, 20 sit-ups, 40 sec plank' },
      { day: 2, name: 'Tempo Run', exercises: '40 min run with 15 min at strong pace' },
      { day: 3, name: 'Strength & Carry', exercises: 'Farmer carries, weighted lunges, core finisher' },
      { day: 4, name: 'PTI Special', exercises: '10 x 1 min hard effort bodyweight burnout' },
    ]
  }
];

// Badges
const BADGES = [
  { id: 'first_parade', name: 'First Parade', icon: 'flag', description: 'Completed first session', color: '#22c55e' },
  { id: 'week_warrior', name: 'Week Warrior', icon: 'calendar', description: 'Full week completed', color: '#3b82f6' },
  { id: 'phase_complete', name: 'Phase Complete', icon: 'trophy', description: 'Finished a programme phase', color: '#f59e0b' },
  { id: 'pti_standard', name: 'PTI Standard', icon: 'medal', description: 'Achieved 80+ Standards Score', color: '#8b5cf6' },
  { id: 'iron_discipline', name: 'Iron Discipline', icon: 'shield-checkmark', description: '4 weeks consecutive', color: '#ef4444' },
  { id: 'beast_mode', name: 'Beast Mode', icon: 'flame', description: 'Completed challenge ladder', color: '#ec4899' },
];

// Challenge Ladder
const CHALLENGES = [
  { id: 'naafi_run', name: 'The NAAFI Run', description: '3km in under 18 minutes', icon: 'walk' },
  { id: 'pressup_challenge', name: 'Press-Up Challenge', description: 'Max press-ups in 2 minutes', icon: 'fitness' },
  { id: 'plank_hold', name: 'Plank Hold', description: 'Hold for 2+ minutes', icon: 'body' },
  { id: 'burpee_blast', name: 'Burpee Blast', description: '50 burpees for time', icon: 'flash' },
  { id: 'the_beasting', name: 'The Beasting', description: 'Full circuit, no rest', icon: 'barbell' },
];

// Veteran Fitness Resources
const VETERAN_RESOURCES = [
  { name: 'Help for Heroes', url: 'https://www.helpforheroes.org.uk/get-support/how-we-can-help-you/physical-health/', description: 'Physical health support for veterans' },
  { name: 'Invictus Games', url: 'https://invictusgamesfoundation.org/', description: 'Sport for wounded veterans' },
  { name: 'Battle Back', url: 'https://www.helpforheroes.org.uk/get-support/how-we-can-help-you/sports-recovery/', description: 'Sports recovery programme' },
  { name: 'Walking With The Wounded', url: 'https://walkingwiththewounded.org.uk/', description: 'Adventure challenges for veterans' },
  { name: 'Veterans Yoga Project', url: 'https://veteransyoga.org.uk/', description: 'Yoga & mindfulness for veterans' },
];

export default function GymScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [currentWeek, setCurrentWeek] = useState(1);
  const [completedWorkouts, setCompletedWorkouts] = useState<string[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [standardsScore, setStandardsScore] = useState(0);
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);
  const [showChallenges, setShowChallenges] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem('frankie_progress');
      if (saved) {
        const data = JSON.parse(saved);
        setCurrentWeek(data.currentWeek || 1);
        setCompletedWorkouts(data.completedWorkouts || []);
        setEarnedBadges(data.earnedBadges || []);
        setStandardsScore(data.standardsScore || 0);
      }
    } catch (e) {
      console.log('Error loading progress:', e);
    }
  };

  const saveProgress = async (updates: any) => {
    try {
      const current = {
        currentWeek,
        completedWorkouts,
        earnedBadges,
        standardsScore,
        ...updates
      };
      await AsyncStorage.setItem('frankie_progress', JSON.stringify(current));
    } catch (e) {
      console.log('Error saving progress:', e);
    }
  };

  const markWorkoutComplete = async (workoutId: string) => {
    if (!completedWorkouts.includes(workoutId)) {
      const updated = [...completedWorkouts, workoutId];
      setCompletedWorkouts(updated);
      
      // Update standards score
      const newScore = Math.min(100, standardsScore + 5);
      setStandardsScore(newScore);
      
      // Check for badges
      const newBadges = [...earnedBadges];
      if (updated.length === 1 && !newBadges.includes('first_parade')) {
        newBadges.push('first_parade');
      }
      if (updated.length >= 3 && !newBadges.includes('week_warrior')) {
        newBadges.push('week_warrior');
      }
      if (newScore >= 80 && !newBadges.includes('pti_standard')) {
        newBadges.push('pti_standard');
      }
      setEarnedBadges(newBadges);
      
      await saveProgress({ completedWorkouts: updated, standardsScore: newScore, earnedBadges: newBadges });
    }
  };

  const getCurrentPhase = () => {
    if (currentWeek <= 4) return 0;
    if (currentWeek <= 8) return 1;
    return 2;
  };

  const styles = createStyles(colors, theme);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>The Gym</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Frankie Hero Section */}
        <View style={styles.heroSection}>
          <Image source={{ uri: FRANKIE_AVATAR }} style={styles.frankieAvatar} />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Meet Frankie</Text>
            <Text style={styles.heroSubtitle}>Your PTI - Physical Training Instructor</Text>
          </View>
        </View>

        {/* Frankie Bio */}
        <View style={styles.bioCard}>
          <Text style={styles.bioText}>
            "Right then soldier, Frankie here! I'm your PTI - that's Physical Training Instructor for you civvies. 
            I've got a 12-week programme that'll have you fighting fit. No passengers, no excuses - just results. 
            Remember: pain is just weakness leaving the body! Now drop and give me twenty... only joking! 
            Unless you want to? 😉"
          </Text>
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => router.push('/chat/frankie')}
          >
            <Ionicons name="chatbubbles" size={20} color="#fff" />
            <Text style={styles.chatButtonText}>Chat with Frankie</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>Week {currentWeek}</Text>
            <Text style={styles.statLabel}>Current</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{standardsScore}</Text>
            <Text style={styles.statLabel}>Standards Score</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{earnedBadges.length}/{BADGES.length}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>

        {/* 12-Week Programme */}
        <View style={styles.sectionHeader}>
          <Ionicons name="barbell" size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>12-Week Programme</Text>
        </View>

        {PROGRAMME_PHASES.map((phase, index) => (
          <TouchableOpacity 
            key={phase.phase}
            style={[
              styles.phaseCard,
              getCurrentPhase() === index && styles.activePhaseCard,
              { borderLeftColor: phase.color }
            ]}
            onPress={() => setSelectedPhase(selectedPhase === index ? null : index)}
          >
            <View style={styles.phaseHeader}>
              <View>
                <Text style={styles.phaseName}>Phase {phase.phase}: {phase.name}</Text>
                <Text style={styles.phaseWeeks}>Weeks {phase.weeks} • {phase.frequency}</Text>
                <Text style={styles.phaseFocus}>{phase.focus}</Text>
              </View>
              <View style={[styles.phaseIndicator, { backgroundColor: phase.color }]}>
                <Text style={styles.phaseIndicatorText}>
                  {getCurrentPhase() === index ? 'ACTIVE' : getCurrentPhase() > index ? 'DONE' : 'LOCKED'}
                </Text>
              </View>
            </View>
            
            {selectedPhase === index && (
              <View style={styles.workoutList}>
                {phase.workouts.map((workout) => {
                  const workoutId = `phase${phase.phase}_day${workout.day}`;
                  const isComplete = completedWorkouts.includes(workoutId);
                  return (
                    <TouchableOpacity 
                      key={workout.day}
                      style={[styles.workoutItem, isComplete && styles.workoutComplete]}
                      onPress={() => markWorkoutComplete(workoutId)}
                    >
                      <View style={styles.workoutDay}>
                        <Ionicons 
                          name={isComplete ? 'checkmark-circle' : 'ellipse-outline'} 
                          size={24} 
                          color={isComplete ? '#22c55e' : colors.textSecondary} 
                        />
                        <Text style={styles.workoutDayText}>Day {workout.day}</Text>
                      </View>
                      <View style={styles.workoutDetails}>
                        <Text style={styles.workoutName}>{workout.name}</Text>
                        <Text style={styles.workoutExercises}>{workout.exercises}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Challenge Ladder */}
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => setShowChallenges(!showChallenges)}
        >
          <Ionicons name="trophy" size={24} color="#f59e0b" />
          <Text style={styles.sectionTitle}>Military Challenge Ladder</Text>
          <Ionicons 
            name={showChallenges ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>

        {showChallenges && (
          <View style={styles.challengeGrid}>
            {CHALLENGES.map((challenge) => (
              <View key={challenge.id} style={styles.challengeCard}>
                <Ionicons name={challenge.icon as any} size={32} color="#f59e0b" />
                <Text style={styles.challengeName}>{challenge.name}</Text>
                <Text style={styles.challengeDesc}>{challenge.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Badges */}
        <View style={styles.sectionHeader}>
          <Ionicons name="medal" size={24} color="#8b5cf6" />
          <Text style={styles.sectionTitle}>Your Badges</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScroll}>
          {BADGES.map((badge) => {
            const isEarned = earnedBadges.includes(badge.id);
            return (
              <View 
                key={badge.id} 
                style={[styles.badgeCard, !isEarned && styles.badgeLocked]}
              >
                <View style={[styles.badgeIcon, { backgroundColor: isEarned ? badge.color : '#6b7280' }]}>
                  <Ionicons name={badge.icon as any} size={28} color="#fff" />
                </View>
                <Text style={[styles.badgeName, !isEarned && styles.badgeLockedText]}>{badge.name}</Text>
                <Text style={styles.badgeDesc}>{badge.description}</Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Veteran Fitness Resources */}
        <View style={styles.sectionHeader}>
          <Ionicons name="link" size={24} color="#3b82f6" />
          <Text style={styles.sectionTitle}>Veteran Fitness Resources</Text>
        </View>

        <View style={styles.resourceList}>
          {VETERAN_RESOURCES.map((resource) => (
            <TouchableOpacity 
              key={resource.name}
              style={styles.resourceCard}
              onPress={() => Linking.openURL(resource.url)}
            >
              <View style={styles.resourceContent}>
                <Text style={styles.resourceName}>{resource.name}</Text>
                <Text style={styles.resourceDesc}>{resource.description}</Text>
              </View>
              <Ionicons name="open-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* PTI Quote */}
        <View style={styles.quoteCard}>
          <Ionicons name="megaphone" size={32} color="#22c55e" />
          <Text style={styles.quoteText}>
            "If it doesn't challenge you, it doesn't change you! Now crack on, soldier!"
          </Text>
          <Text style={styles.quoteAuthor}>- Frankie, PTI</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, theme: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme === 'dark' ? '#1f2937' : '#f0fdf4',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  frankieAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#22c55e',
  },
  heroContent: {
    flex: 1,
    marginLeft: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#22c55e',
    fontWeight: '600',
    marginTop: 4,
  },
  bioCard: {
    margin: 16,
    padding: 16,
    backgroundColor: theme === 'dark' ? '#374151' : '#fff',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bioText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: theme === 'dark' ? '#1f2937' : '#f8fafc',
    marginHorizontal: 16,
    borderRadius: 12,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#22c55e',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  phaseCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    backgroundColor: theme === 'dark' ? '#374151' : '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activePhaseCard: {
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  phaseName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  phaseWeeks: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  phaseFocus: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 2,
    fontWeight: '500',
  },
  phaseIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  phaseIndicatorText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  workoutList: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  workoutComplete: {
    opacity: 0.6,
  },
  workoutDay: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    gap: 6,
  },
  workoutDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  workoutDetails: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  workoutExercises: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  challengeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
    marginBottom: 16,
  },
  challengeCard: {
    width: '47%',
    padding: 16,
    backgroundColor: theme === 'dark' ? '#374151' : '#fffbeb',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  challengeName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  challengeDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  badgeScroll: {
    paddingLeft: 16,
    marginBottom: 16,
  },
  badgeCard: {
    width: 120,
    padding: 16,
    backgroundColor: theme === 'dark' ? '#374151' : '#fff',
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeLocked: {
    opacity: 0.5,
  },
  badgeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  badgeLockedText: {
    color: colors.textSecondary,
  },
  badgeDesc: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  resourceList: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme === 'dark' ? '#374151' : '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resourceContent: {
    flex: 1,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  resourceDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  quoteCard: {
    margin: 16,
    padding: 20,
    backgroundColor: theme === 'dark' ? '#1f2937' : '#f0fdf4',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#22c55e',
    borderStyle: 'dashed',
  },
  quoteText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '700',
    marginTop: 8,
  },
});
